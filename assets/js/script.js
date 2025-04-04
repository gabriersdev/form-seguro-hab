import {
  isEmpty, verificarCPF, zeroEsquerda,
} from './modulos/utilitarios.js';
import content from "./modulos/content.js"

(() => {
  const MODE = 1
  
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
  
  const replace = (quant, string, add) => {
    let strReturn = String(string);
    if (typeof string === 'string' && quant > string.length) {
      for (let i = string.length; i < quant; i += 1) {
        strReturn += String(add);
      }
      return strReturn;
    }
    return string;
  };
  
  const refsAndSpaces = Array.from(document.querySelectorAll('sxs[refer]')).map(e => [e.getAttribute('refer'), e.textContent.match(/\s/g).length || 10]);
  
  function showModalEditInfos() {
    document.querySelector('#modal-editar-informacoes').showModal();
    setTimeout(() => {
      document.querySelector('#modal-editar-informacoes').querySelectorAll('input')[0].focus();
    }, 0);
  }
  
  function send(form) {
    const inputs = Array.from(document.querySelectorAll('input')).map(e => e.dataset.input);
    const formData = Array.from(inputs.map(i => [i, form.querySelector(`[data-input="${i}"]`).value]))
    
    // Adiciona o numero da operacao ao numero da conta, depois remove o cc_operacao do array
    const cOperation = formData.find(f => f[0] === "cc_operacao");
    const cNumber = formData.find(f => f[0] === "cc_numero")
    
    if (cOperation && cNumber) {
      cNumber[1] = `${cOperation[1]}.${cNumber[1]}`;
      formData.splice(formData.indexOf(cOperation), 1);
    } else alert("Faltou preencher o número ou a operação da conta!")
    
    // Cria o item date_full e remove data_assinatura e cidade
    const city = formData.find(f => f[0] === "cidade");
    const signDate = formData.find(f => f[0] === "data_assinatura");
    
    if (city && signDate) {
      const date = new Date(`${signDate[1]}T00:00:00Z`)
      formData.push(["date_full", `${city[1]}, ${('0' + date.getDay()).slice(-2)} de ${date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      })}`])
    } else alert("Faltou preencher a cidade ou a data de assinatura!")
    
    // Para cada [data-input] que começar com CPF_ e ser seguido de 1 número, cria um item no array como prop_ e o número
    formData.toSorted((a, b) => a[0].localeCompare(b[0])).filter(f => f[0].match(/CPF_\d/g)).forEach((prop, index) => {
      if (prop[1]) formData.push([`prop_${index + 1}`, 'X'])
    })
    
    formData.forEach(i => {
      const sxs = document.querySelector(`sxs[refer="${i[0]}"]`)
      if (sxs) sxs.textContent = replace(refsAndSpaces.find(r => r[0] === i[0])[1], i[1], ' ')
    })
  }
  
  function attributeActions() {
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
  
  function attributeMask(param, input_atribuicao) {
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
  
  const verifyValuesInParams = () => {
    try {
      const url = new URLSearchParams(window.location.search);
      const paramsInsert = Array.from(document.querySelectorAll('sxs[refer]')).map((sxs) => sxs.getAttribute('refer'));
      const manipulateParams = paramsInsert;
      
      let urlKeys = []
      
      for (let u of url.entries()) {
        urlKeys.push(u[0])
      }
      
      if (!urlKeys.find(k => paramsInsert.map(p => p.toLowerCase()).includes(k.toLowerCase()))) return;
      
      if (!isEmpty(paramsInsert) && url.size > 0) {
        paramsInsert.forEach((param) => {
          if (url.has(param) && !isEmpty(url.get(param))) {
            const element = document.querySelector(`[data-input=${param}]`);
            const {type} = element;
            
            switch (type) {
              case 'text':
                if (manipulateParams.includes(param)) {
                  switch (param) {
                    case 'CPF_1':
                    case 'CPF_2':
                    case 'CPF_3':
                    case 'CPF_4':
                      element.value = url.get(param).replace(/\D/g, '').substring(0, 11) || '';
                      attributeMask('cpf', element);
                      if (verificarCPF(element.value)) $(element.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeOut(500);
                      else $(element.closest('.area-validation-CPF').querySelector('.icon-invalid-CPF')).fadeIn(500);
                      break;
                    
                    case 'n_contrato':
                      element.value = url.get(param).replace(/\D/g, '').substring(0, 16) || '';
                      attributeMask('numero-contrato', element);
                      break;
                    
                    case 'cc_numero':
                      const valor = url.get(param).replace(/\D/g, '') || '';
                      element.value = (valor);
                      attributeMask('conta', element);
                      if (element.dataset.input === 'cc_numero') console.log('cc_numero', element);
                      break;
                    
                    case 'cc_agencia':
                      element.value = (url.get(param).replace(/\D/, '') || '').substring(0, 4);
                      attributeMask('agencia', element);
                      break;
                  }
                } else element.value = url.get(param).replaceAll('-', ' ');
                break;
              
              case 'checkbox':
              case 'radio':
                element.checked = (url.get(param) === 'true');
                break;
            }
          }
        });
        
        send(document.querySelector("form[data-action='formulario-editar-informacoes']"));
        
        // Clicando no botão de impressão
        setTimeout(() => {
          document.querySelector('.btn-impressao').click();
        }, 500);
      }
    } catch (error) {
      console.log('Ocorreu um erro ao tentar recuperar os dados da URL. Erro: %s', error);
    }
  }
  
  window.addEventListener('load', () => {
    $('.overlay').hide();
    attributeActions();
    attributeMask();
    verifyValuesInParams();
    
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
        showModalEditInfos();
      }
    }
  });
  
  // Preenche campos para testar
  if (MODE === 0) {
    const testValues = {
      "CPF_1": "123.456.789-09",
      "CPF_2": "123.456.789-09",
      "CPF_3": "123.456.789-09",
      "CPF_4": "123.456.789-09",
      "n_contrato": "12345678909123",
      "cc_agencia": "1700",
      "cc_operacao": "3701",
      "cc_numero": "0005500000001",
      "cidade": "BELO HORIZONTE",
      "data_assinatura": "2025-03-01Z00:00:00"
    }
    
    for (let id in testValues) {
      document.getElementById(id).value = testValues[id];
    }
  }
})();
