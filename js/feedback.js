document.addEventListener("DOMContentLoaded", function () {
  // Número de WhatsApp que recebe os feedbacks (DDI + DDD + número)
  const WHATSAPP_NUMERO = "5511977939054";

  const btnEnviar     = document.getElementById("btnEnviarFeedback");
  if (!btnEnviar) return;

  const btnText       = document.getElementById("feedbackBtnText");
  const btnLoading    = document.getElementById("feedbackBtnLoading");
  const inputNome     = document.getElementById("feedbackNome");
  const inputEmail    = document.getElementById("feedbackEmail");
  const inputMensagem = document.getElementById("feedbackMensagem");
  const toastElement  = document.getElementById("feedbackToast");
  const toastMessage  = document.getElementById("toastMessage");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showToast(text) {
    if (!toastElement || typeof bootstrap === "undefined") return;
    if (toastMessage) toastMessage.textContent = text;
    bootstrap.Toast.getOrCreateInstance(toastElement).show();
  }

  btnEnviar.addEventListener("click", function (event) {
    event.preventDefault();

    const nome     = inputNome.value.trim();
    const email    = inputEmail.value.trim();
    const mensagem = inputMensagem.value.trim();

    if (!nome || !email || !mensagem) {
      showToast("Preencha nome, e-mail e mensagem para enviar.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showToast("Digite um e-mail válido, como nome@empresa.com.");
      inputEmail.focus();
      return;
    }

    const texto = `Olá! Gostaria de deixar um feedback:\n\n*Nome:* ${nome}\n*E-mail:* ${email}\n\n*Mensagem:*\n${mensagem}`;
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;

    // Abre na hora do clique: dentro de setTimeout o navegador bloqueia o popup.
    window.open(url, "_blank", "noopener");

    btnEnviar.disabled = true;
    btnText.classList.add("d-none");
    btnLoading.classList.remove("d-none");

    setTimeout(() => {
      inputNome.value = inputEmail.value = inputMensagem.value = "";
      btnEnviar.disabled = false;
      btnText.classList.remove("d-none");
      btnLoading.classList.add("d-none");
      showToast("Mensagem pronta no WhatsApp. É só tocar em enviar.");
    }, 800);
  });
});
