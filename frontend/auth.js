import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const elements = {
  loggedOut: document.querySelector("#auth-logged-out"),
  loggedIn: document.querySelector("#auth-logged-in"),
  email: document.querySelector("#auth-email"),
  password: document.querySelector("#auth-password"),
  login: document.querySelector("#auth-login"),
  signup: document.querySelector("#auth-signup"),
  logout: document.querySelector("#auth-logout"),
  message: document.querySelector("#auth-message"),
  userEmail: document.querySelector("#auth-user-email")
};

const hasAuthUi = elements.email && elements.password && elements.login && elements.signup && elements.logout && elements.message;
const url = window.SUPABASE_URL;
const key = window.SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;

function setAuthMessage(message, isError = false) {
  if (!elements.message) return;
  elements.message.textContent = message;
  elements.message.classList.toggle("auth-message--error", isError);
}

function renderAuthPanel(user) {
  if (!elements.loggedOut || !elements.loggedIn || !elements.userEmail) return;

  if (user) {
    elements.loggedOut.style.display = "none";
    elements.loggedIn.style.display = "";
    elements.userEmail.textContent = user.email || "";
    setAuthMessage("");
  } else {
    elements.loggedOut.style.display = "";
    elements.loggedIn.style.display = "none";
    elements.userEmail.textContent = "";
  }
}

function setAuthBusy(isBusy) {
  if (elements.login) elements.login.disabled = isBusy;
  if (elements.signup) elements.signup.disabled = isBusy;
}

function readCredentials() {
  return {
    email: elements.email.value.trim(),
    password: elements.password.value
  };
}

async function handleLogin() {
  if (!supabase) {
    setAuthMessage("Supabase設定を読み込めませんでした。ページを再読み込みしてください。", true);
    return;
  }

  const { email, password } = readCredentials();
  if (!email || !password) {
    setAuthMessage("メールアドレスとパスワードを入力してください。", true);
    return;
  }

  setAuthBusy(true);
  setAuthMessage("ログイン中...");

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthMessage(error.message || "ログインに失敗しました。", true);
      return;
    }
    elements.password.value = "";
    setAuthMessage("");
  } catch (error) {
    setAuthMessage(error.message || "ログインに失敗しました。", true);
  } finally {
    setAuthBusy(false);
  }
}

async function handleSignup() {
  if (!supabase) {
    setAuthMessage("Supabase設定を読み込めませんでした。ページを再読み込みしてください。", true);
    return;
  }

  const { email, password } = readCredentials();
  if (!email || !password) {
    setAuthMessage("メールアドレスとパスワードを入力してください。", true);
    return;
  }

  if (password.length < 6) {
    setAuthMessage("パスワードは6文字以上にしてください。", true);
    return;
  }

  setAuthBusy(true);
  setAuthMessage("登録中...");

  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthMessage(error.message || "登録に失敗しました。", true);
      return;
    }
    elements.password.value = "";
    setAuthMessage("確認メールを送信しました。メールを確認してください。");
  } catch (error) {
    setAuthMessage(error.message || "登録に失敗しました。", true);
  } finally {
    setAuthBusy(false);
  }
}

async function handleLogout() {
  if (!supabase) {
    setAuthMessage("Supabase設定を読み込めませんでした。ページを再読み込みしてください。", true);
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    setAuthMessage(error.message || "ログアウトに失敗しました。", true);
  }
}

if (hasAuthUi && !window.__langDeskAuthBound) {
  window.__langDeskAuthBound = true;

  elements.login.addEventListener("click", handleLogin);
  elements.signup.addEventListener("click", handleSignup);
  elements.logout.addEventListener("click", handleLogout);
  elements.password.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  });
  elements.email.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      elements.password.focus();
    }
  });

  if (!supabase) {
    setAuthMessage("Supabase設定を読み込めませんでした。ページを再読み込みしてください。", true);
  } else {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setAuthMessage(error.message || "Supabase接続に失敗しました。", true);
        return;
      }
      renderAuthPanel(data.session?.user ?? null);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      renderAuthPanel(session?.user ?? null);
    });
  }
}
