// Copie estes valores de Project Settings > API no Supabase.
// Use a chave pública (anon/publishable), nunca a service_role.
const SUPABASE_URL = "https://kohzsopdntmeiukwwcvd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mPzUZtUI18J8zLTXv8fFfg_Sgr2dVxj";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Elementos da página.
const form = document.querySelector("#auth-form");
const message = document.querySelector("#message");
const nameField = document.querySelector("#name-field");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const submitButton = document.querySelector("#submit-button");
const toggleButton = document.querySelector("#toggle-mode");
const title = document.querySelector("#title");
const toggleText = document.querySelector("#toggle-text");
const authView = document.querySelector("#auth-view");
const loggedView = document.querySelector("#logged-view");
const userEmail = document.querySelector("#user-email");
const logoutButton = document.querySelector("#logout-button");

let isSignUp = false;

// Mostra mensagens de erro ou sucesso.
function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`;
}

// Alterna entre login e cadastro.
toggleButton.addEventListener("click", () => {
  isSignUp = !isSignUp;
  title.textContent = isSignUp ? "Criar conta" : "Entrar";
  submitButton.textContent = isSignUp ? "Criar conta" : "Entrar";
  nameField.hidden = !isSignUp;
  nameInput.required = isSignUp;
  passwordInput.minLength = isSignUp ? 8 : 1;
  toggleText.textContent = isSignUp
    ? "Já tem uma conta?"
    : "Ainda não tem uma conta?";
  toggleButton.textContent = isSignUp ? "Entrar" : "Criar conta";

  showMessage("");
});

// Envia o formulário para o Supabase.
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");
  submitButton.disabled = true;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    if (isSignUp) {
      // Cadastra uma conta nova.
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nameInput.value.trim() }
        }
      });
      if (error) throw error;

      // Se não houver sessão, o Supabase pode exigir confirmação por e-mail.
      if (!data.session) {
        showMessage("Confira seu e-mail para confirmar a conta.", "success");
      }
    } else {
      // Entra em uma conta existente.
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    }
  } catch (error) {
    showMessage(error.message, "error");
  }

  submitButton.disabled = false;
});

// Mostra a tela correspondente à sessão atual. (CORRIGIDO)
function showSession(user) {
  // Se o usuário existe, esconde a tela de auth e mostra a tela logada
  authView.style.display = user ? "none" : "block";
  loggedView.style.display = user ? "block" : "none";

  if (user) {
    userEmail.textContent = user.email;
  }
}

// Atualiza a página quando o usuário entra ou sai.
supabaseClient.auth.onAuthStateChange((_event, session) => {
  showSession(session?.user);
});

// Encerra a sessão.
logoutButton.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    showMessage(error.message, "error");
  }
});