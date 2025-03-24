const isEmpty = (valor) => {
  if (typeof valor === 'string') {
    return valor === undefined || valor === null || valor.length <= 0;
  } if (Array.isArray(valor)) {
    return valor.length <= 0;
  } if (typeof valor === 'object') {
    return Object.keys(valor).length <= 0;
  }
  return valor === undefined || valor === null;
};

const capitalize = (valor) => valor.charAt(0).toUpperCase() + valor.substr(1, valor.length);

const atualizarDatas = () => {
  const dataAtual = new Date();
  document.querySelectorAll('[data-ano-atual]').forEach((area) => {
    area.textContent = `${dataAtual.getFullYear()}`;
  });
};

const controleFechamentoModal = () => {
  const modais = document.querySelectorAll('.modal');
  modais.forEach((modal) => {
    const btnFecha = modal.querySelector('[data-modal-fecha]');
    btnFecha.addEventListener('click', () => {
      $(`#${modal.id}`).modal('hide');
    });
  });
};

function sanitizarString(string) {
  if (typeof string === 'string') {
    const substituir = [
      {
        original: '-',
        subst: '',
      },
      {
        original: '(',
        subst: '',
      },
      {
        original: ')',
        subst: '',
      },
      {
        original: ' ',
        subst: '',
      },
    ];

    let string_subst = '';
    substituir.forEach((substituicao) => {
      string_subst = string.replace(substituicao.original, substituicao.subst);
    });

    return string_subst.trim();
  }
  console.log('O tipo do parâmetro passado não é uma string.');
  return null;
}

function tooltips() {
  $(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });
}

function popovers() {
  $(document).ready(() => {
    $('[data-bs-toggle="popover"]').popover();
  });
}

async function SwalAlert(tipo, {
  icon, title, comp, confirmacao,
}) {
  tipo_lower = tipo.toLowerCase().trim();

  // comp: text, mensagem, timer
  // confirmacao: label, showCancelButton, focusCancel

  switch (tipo_lower) {
    case 'confirmacao':
      const dialog = await Swal.fire({
        icon,
        title,
        text,
        showCancelButton: confirmacao.showCancelButton,
        confirmButtonText: confirmacao.label,
        focusCancel: confirmacao.focusCancel,
        timer: comp.timer,
      });

      return new Promise((resolve) => {
        resolve({ confirmed: dialog.isConfirmed });
      });

    case 'aviso':
    case 'error':
    default:
      Swal.fire({
        icon,
        title,
        text: comp.text,
        footer: comp.mensagem,
        timer: comp.timer,
      });
      break;
  }
}

const copiar = async (valor) => {
  await navigator.clipboard.writeText(valor);
};

function verificarCPF(cpf) {
  let resultado = false;
  const CPF_replaced = cpf.replace(/\D/g, '');
  
  switch (cpf) {
    case '00000000000':
    case '11111111111':
    case '22222222222':
    case '33333333333':
    case '44444444444':
    case '55555555555':
    case '66666666666':
    case '77777777777':
    case '88888888888':
    case '99999999999':
      return false;
    default: 
    if (CPF_replaced.toString().length !== 11 || /^(\d)\1{10}$/.test(CPF_replaced)) return false;
    resultado = true;
    [9, 10].forEach((j) => {
      let soma = 0; 
      let r;
      CPF_replaced.split(/(?=)/).splice(0, j).forEach((e, i) => {
        soma += parseInt(e, 10) * ((j + 2) - (i + 1));
      });
      r = soma % 11;
      r = (r < 2) ? 0 : 11 - r;
      if (r !== parseInt(CPF_replaced.substring(j, j + 1), 10)) resultado = false;
    });
  }
  
  return resultado;
}

function zeroEsquerda(quantidadeZeros, valor) {
  let zeros;

  for (let i = 0; i < quantidadeZeros; i += 1) {
    zeros += '0';
  }

  return (zeros + valor).slice(-quantidadeZeros);
}

function desanitizarStringURL(string) {
  if (!isEmpty(string)) {
    return string.replaceAll('-', ' ').replaceAll('%20', ' ');
  }
  return '';
}

function sanitizarStringParaURL(string) {
  if (!isEmpty(string)) {
    return string.trim().toLowerCase().replaceAll(' ', '-');
  }
  return '';
}

const converterParaMesBRL = (numero) => {
  try {
    const numero_parsed = parseInt(numero, 10);
    if (typeof numero_parsed === 'number') {
      let mes = null;
      switch (numero_parsed + 1) {
        case 1: mes = 'janeiro'; break;
        case 2: mes = 'fevereiro'; break;
        case 3: mes = 'março'; break;
        case 4: mes = 'abril'; break;
        case 5: mes = 'maio'; break;
        case 6: mes = 'junho'; break;
        case 7: mes = 'julho'; break;
        case 8: mes = 'agosto'; break;
        case 9: mes = 'setembro'; break;
        case 10: mes = 'outubro'; break;
        case 11: mes = 'novembro'; break;
        case 12: mes = 'dezembro'; break;
        default: mes = 'janeiro'; break;
      }

      return mes;
    }
    return null;
  } catch (error) {
    console.warn('O valor informado não é um número');
    return null;
  }
};

function numero_e_digito(numero_conta) {
  let numero = '';
  let digito = '';

  if (numero_conta.length > 1) {
    numero = numero_conta.substring(0, numero_conta.length - 1);
    digito = numero_conta[numero_conta.length - 1];
  } else if (numero_conta.length > 0) {
    numero = numero_conta;
  }

  return { numero, digito };
}

export {
  isEmpty,
  capitalize,
  atualizarDatas,
  controleFechamentoModal,
  sanitizarString,
  tooltips,
  popovers,
  SwalAlert,
  copiar,
  verificarCPF,
  zeroEsquerda,
  desanitizarStringURL,
  sanitizarStringParaURL,
  converterParaMesBRL,
  numero_e_digito,
};
