import {
  isEmpty, numero_e_digito, verificarCPF, zeroEsquerda,
} from './modulos/utilitarios.js';
import content from "./modulos/content.js"

(() => {
  try {
    document.querySelector('#page-container').innerHTML += content
  } catch (e) {
    console.log(e)
  }
  
  try {
    pdf2htmlEX.defaultViewer = new pdf2htmlEX.Viewer({});
  } catch (e) {
    console.log(e);
  }
  
  document.querySelectorAll('[data-recarrega-pagina]').forEach((botao) => {
    botao.addEventListener('click', () => {
      window.location.reload();
    });
  });
  
  try {
    pdf2htmlEX.defaultViewer = new pdf2htmlEX.Viewer({});
  } catch (error) {
    console.log('Um erro ocorreu. Erro: %s', error);
  }
  
  const replice = (quant, string, add) => {
    let strReturn = String(string);
    if (typeof string === 'string' && quant > string.length) {
      for (let i = string.length; i < quant; i += 1) {
        strReturn += String(add);
      }
      return strReturn;
    }
    return string;
  };
  
  function atribuirLinks() {
    const linkElementos = document.querySelectorAll('[data-link]');
    
    linkElementos.forEach((link) => {
      switch (link.dataset.link.toLowerCase().trim()) {
        case 'github-dev':
          link.href = 'https://github.com/gabriersdev';
          break;
        
        case 'github-projeto':
          link.href = 'https://github.com/gabriersdev/form-seguro-hab';
          break;
      }
      
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }
  
  function exibirModalEditarInformacoes() {
    document.querySelector('#modal-editar-informacoes').showModal();
    setTimeout(() => {
      document.querySelector('#modal-editar-informacoes').querySelectorAll('input')[0].focus();
    }, 0);
  }
  
  // TODO - refazer com os campos do formulário de seguro
  function send(form) {
    const inputs = ['cc_agencia', 'cc_numero', 'cc_digito', 'CPF_1', 'CPF_2', 'CPF_3', 'CPF_4'];
    // TODO - dar o tratamento e fazer o preenchimento dos dados
    console.log(form)
    console.log(Array.from(inputs.map(i => form.querySelector(`[data-input="${i}"]`))))
  }
  
  function atribuirAcoes() {
    const acoes = document.querySelectorAll('[data-action]');
    
    acoes.forEach((acao) => {
      switch (acao.dataset.action) {
        case 'acao':
          break;
        
        case 'editar':
          try {
            $(acao).on('click', (event) => {
              event.preventDefault();
              document.querySelector('#modal-editar-informacoes').showModal();
              setTimeout(() => {
                document.querySelector('#modal-editar-informacoes').querySelectorAll('input')[0].focus();
              }, 0);
            });
          } catch (error) {
            console.log('Um erro ocorreu. Erro: %s', error);
          }
          break;
        
        case 'fechar-modal':
          $(acao).on('click', (event) => {
            event.preventDefault();
            (acao.closest('dialog')).close();
          });
          break;
        
        case 'formulario-editar-informacoes':
          $(acao).on('submit', (event) => {
            event.preventDefault();
            send(event.target);
            acao.closest('dialog').close();
          });
          break;
        
        default:
          console.warn('A ação não foi implementada.');
          break;
      }
    });
  }
  
  function atribuirMascaras(param, input_atribuicao) {
    if (isEmpty(param) && isEmpty(input_atribuicao)) {
      document.querySelectorAll('[data-mascara]').forEach((input) => {
        switch (input.dataset.mascara.trim().toLowerCase()) {
          case 'cpf':
            $(input).mask('000.000.000-00');
            $(input).on('input', (evento) => {
              if (verificarCPF(evento.target.value)) {
                $(evento.target.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeOut(500);
              } else {
                $(evento.target.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeIn(500);
              }
            });
            break;
          
          case 'numero-contrato':
            $(input).mask('0.0000.0000000-0');
            break;
          
          case 'data':
            $(input).mask('00/00/0000');
            break;
          
          case 'agencia':
            $(input).mask('0000', {reverse: true});
            break;
          
          case 'operacao':
            $(input).mask('0000', {reverse: true});
            break;
          
          case 'conta':
            $(input).mask('000000000000-0', {reverse: true});
            break;
          
          default:
            throw new Error('Ação não implementada para o link informado.');
        }
      });
    } else {
      switch (param.toLowerCase().trim()) {
        case 'agencia':
          $(input_atribuicao).mask('0000', {reverse: true});
          break;
        
        case 'operacao':
          $(input_atribuicao).mask('0000', {reverse: true});
          break;
        
        case 'cpf':
          $(input_atribuicao).mask('000.000.000-00', {reverse: true});
          break;
        
        case 'numero-contrato':
          $(input_atribuicao).mask('0.0000.0000000-0', {reverse: true});
          break;
        
        case 'conta':
          $(input_atribuicao).mask('000000000000-0', {reverse: true});
          break;
      }
    }
  }
  
  window.addEventListener('load', () => {
    $('.overlay').hide();
    atribuirLinks();
    atribuirAcoes();
    atribuirMascaras();
    
    $('input').each((index, input) => {
      input.setAttribute('autocomplete', 'off');
    });
    
    $('input[type=checkbox],input[type=radio]').each((index, input) => {
      $(input).on('focus', () => {
        $(input.closest('.form-group')).addClass('focus');
      });
      
      $(input).on('blur', () => {
        $(input.closest('.form-group')).removeClass('focus');
      });
    });
    
    try {
      const moment = new Date();
      $('#data_assinatura').val(`${moment.getFullYear()}-${zeroEsquerda(2, moment.getMonth() + 1)}-${zeroEsquerda(2, moment.getDate())}`);
    } catch (error) {
      console.log('Um erro ocorreu. Erro: %s', error);
    }
  });
  
  const beforePrint = () => {
    $('#controle').hide();
  };
  
  const afterPrint = () => {
    $('#controle').show();
  };
  
  if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener((mql) => {
      if (mql.matches) {
        beforePrint();
      } else {
        afterPrint();
      }
    });
  }
  
  window.onbeforeprint = beforePrint();
  window.onafterprint = afterPrint();
  
  $('.btn-impressao').on('click', (event) => {
    event.preventDefault();
    window.print();
  });
  
  // Ativar modal editar informações
  document.addEventListener('keyup', (evento) => {
    if (!isEmpty(evento.keyCode)) {
      if (evento.keyCode === 45) {
        exibirModalEditarInformacoes();
      }
    }
  });
})();

const refsAndSpaces = Array.from(document.querySelectorAll('sxs[refer]')).map(e => [e.getAttribute('refer'), e.textContent.match(/\s/g).length]);

console.log(refsAndSpaces);

const verifyValuesInParams = () => {
  try {
    const url = new URLSearchParams(new URL(window.location).search);
    const parametros_insercao = [];
    
    document.querySelectorAll('sxs[refer]').forEach((sxs) => {
      parametros_insercao.push(sxs.getAttribute('refer'));
    });
    
    if (!isEmpty(parametros_insercao) && url.size > 0) {
      // Inclusão de parâmetros como forma de substituição de chaves para tratamento
      if (url.has('conta_comprador_numero')) url.set('cc_numero', url.get('conta_comprador_numero'));
      if (url.has('conta_comprador_agencia')) url.set('cc_agencia', url.get('conta_comprador_agencia'));
      if (url.has('conta_comprador_operacao')) url.set('cc_operacao', url.get('conta_comprador_operacao'));
      
      parametros_insercao.forEach((parametro) => {
        if (url.has(parametro) && !isEmpty(url.get(parametro))) {
          const elemento = document.querySelector(`[data-input=${parametro}]`);
          const {type} = elemento;
          
          const parametros_para_tratar = ['CPF_1', 'CPF_2', 'CPF_3', 'CPF_4', 'n_contrato', 'cc_agencia', 'cc_operacao', 'cc_numero', 'cp_agencia', 'cp_operacao', 'cp_numero'];
          
          switch (type) {
            case 'text':
              if (parametros_para_tratar.includes(parametro)) {
                switch (parametro) {
                  case 'CPF_1':
                  case 'CPF_2':
                  case 'CPF_3':
                  case 'CPF_4':
                    elemento.value = url.get(parametro).replace(/\D/g, '').substring(0, 11) || '';
                    atribuirMascaras('cpf', elemento);
                    if (verificarCPF(elemento.value)) {
                      $(elemento.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeOut(500);
                    } else {
                      $(elemento.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeIn(500);
                    }
                    break;
                  
                  case 'n_contrato':
                    elemento.value = url.get(parametro).replace(/\D/g, '').substring(0, 16) || '';
                    atribuirMascaras('numero-contrato', elemento);
                    break;
                  
                  case 'cc_numero':
                    const valor = url.get(parametro).replace(/\D/g, '') || '';
                    elemento.value = (valor);
                    atribuirMascaras('conta', elemento);
                    if (elemento.dataset.input === 'cc_numero') {
                      console.log('cc_numero', elemento);
                    }
                    break;
                  
                  case 'cc_agencia':
                    elemento.value = (url.get(parametro).replace(/\D/, '') || '').substring(0, 4);
                    atribuirMascaras('agencia', elemento);
                    break;
                }
              } else {
                elemento.value = url.get(parametro).replaceAll('-', ' ');
              }
              break;
            
            case 'checkbox':
            case 'radio':
              elemento.checked = (url.get(parametro) === 'true');
              break;
          }
        }
      });
      
      // TODO - enviarFormulario();
      
      // Clicando no botão de impressão
      setTimeout(() => {
        document.querySelector('.btn-impressao').click();
      }, 500);
    }
  } catch (error) {
    console.log('Ocorreu um erro ao tentar recuperar os dados da URL. Erro: %s', error);
  }
}
