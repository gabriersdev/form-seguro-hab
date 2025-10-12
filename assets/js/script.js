import {isEmpty, verificarCPF, zeroEsquerda} from './modulos/utilitarios.js';
import Form from "./classes/Form.js";
import Forms from "./classes/Forms.js";
import content from "./modulos/content.js"

(() => {
  const MODE = 0;
  
  try {
    document.querySelector('#page-container').innerHTML += content
  } catch (e) {
    alert(`Ocorreu um erro! ${e.message}`)
    console.log(e)
  }
  
  try {
    pdf2htmlEX.defaultViewer = new pdf2htmlEX.Viewer({});
  } catch (e) {
    console.log(e);
  }
  
  try {
    pdf2htmlEX.defaultViewer = new pdf2htmlEX.Viewer({});
  } catch (error) {
    console.log('Um erro ocorreu. Erro: %s', error);
  }
  
  const refsAndSpaces = Array.from(document.querySelectorAll('sxs[refer]')).map(e => [e.getAttribute('refer'), e.textContent.match(/\s/g).length || 10]);
  
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
  
  function showModalEditInfos() {
    document.querySelector('#modal-editar-informacoes').showModal();
    setTimeout(() => {
      document.querySelector('#modal-editar-informacoes').querySelectorAll('input')[0].focus();
    }, 0);
  }
  
  function setAllFields(data) {
    $("#modal-editar-informacoes form")?.[0]?.reset();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "CPF") {
        value.forEach((v, i) => {
          if (!v) return;
          $(`[data-input="CPF_${i + 1}"]`).val(v);
        })
      } else if (key === "accountNumber") $(`[data-input="cc_numero"]`).val(value);
      else if (key === "agencyNumber") $(`[data-input="cc_agencia"]`).val(value);
      else if (key === "operationNumber") $(`[data-input="cc_operacao"]`).val(value);
      else if (key === "cityName") $(`[data-input="cidade"]`).val(value);
      else if (key === "contractNumber") $(`[data-input="n_contrato"]`).val(value);
      else if (key === "signDate") $(`[data-input="data_assinatura"]`).val(value);
    })
  }
  
  function send(form) {
    form = document.querySelector(`form[data-action="${form.dataset.action}"]`)
    
    let inputs = Array.from(document.querySelectorAll('input')).map(e => e.dataset.input);
    inputs = inputs.filter(e => e)
    
    const formData = Array.from(inputs.map(i => [i, form.querySelector(`[data-input="${i}"]`).value]))
    let itsAllOk = true
    
    // Adiciona o numero da operacao ao numero da conta, depois remove o cc_operacao do array
    const cOperation = formData.find(f => f[0] === "cc_operacao");
    const cNumber = formData.find(f => f[0] === "cc_numero")
    const nContract = formData.find(f => f[0] === "n_contrato")
    
    if (cNumber[1].length !== 14) {
      alert("O número da conta deve ter 14 caracteres! Atualmente tem " + cNumber[1].length + " dígitos");
      itsAllOk = false;
      return;
    }
    
    if (cOperation[1] && cNumber[1]) {
      cNumber[1] = `${cOperation[1].toString().substring(0, 4)}.${cNumber[1]}`;
      formData.splice(formData.indexOf(cOperation ?? []), 1);
    } else {
      alert("Faltou preencher o número ou a operação da conta!")
      itsAllOk = false;
      return;
    }
    
    if (!nContract[1]) {
      alert("O número do contrato não foi preenchido!")
      itsAllOk = false;
      return;
    } else if (nContract[1].length !== 16) {
      alert("O número do contrato deve ter 16 caracteres!")
      itsAllOk = false;
      return;
    }
    
    // Cria o item date_full e remove data_assinatura e cidade
    const city = formData.find(f => f[0] === "cidade");
    const signDate = formData.find(f => f[0] === "data_assinatura");
    
    if (city[1] && signDate[1]) {
      const date = new Date(`${signDate[1]}T00:00:00-03:00`)
      formData.push(["date_full", `${city[1]}, ${('0' + date.getDate()).slice(-2)} de ${date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      })}`])
    } else {
      alert("Faltou preencher a cidade ou a data de assinatura!")
      itsAllOk = false;
      return;
    }
    
    // Para cada [data-input] que começar com CPF_ e ser seguido de 1 número, cria um item no array como prop_ e o número
    formData.toSorted((a, b) => a[0].localeCompare(b[0])).filter(f => f[0].match(/CPF_\d/g)).forEach((prop, index) => {
      if (prop[1]) {
        if (verificarCPF(prop[1])) formData.push([`prop_${index + 1}`, 'X'])
        else {
          alert("Um ou mais CPFs estão inválidos!")
          itsAllOk = false;
          return false
        }
      } else {
        formData.push([`prop_${index + 1}`, '  '])
      }
    })
    
    const capa = new Form({
      CPF: formData.filter(f => f[0].includes("CPF")).map(i => i[1]),
      contractNumber: formData.find(f => f[0] === "n_contrato")?.["1"] ?? "",
      agencyNumber: formData.find(f => f[0] === "cc_agencia")?.["1"] ?? "",
      operationNumber: formData.find(f => f[0] === "cc_numero")?.["1"]?.split(".")?.[0] ?? "",
      accountNumber: formData.find(f => f[0] === "cc_numero")?.["1"]?.split(".")?.[1] ?? "",
      cityName: formData.find(f => f[0] === "cidade")?.["1"] ?? "",
      signDate: formData.find(f => f[0] === "data_assinatura")?.["1"] ?? "",
    });
    
    const capas = new Forms();
    capas.setCapasArmazenadas(capa);
    
    if (itsAllOk) {
      formData.forEach(i => {
        const sxs = document.querySelector(`sxs[refer="${i[0]}"]`)
        if (sxs) sxs.textContent = replace(refsAndSpaces.find(r => r[0] === i[0])[1], i[1], ' ')
      })
      
      form.closest('dialog').close();
      
      setTimeout(() => {
        document.querySelector('.btn-impressao').click();
      }, 500);
    }
  }
  
  function attributeActions() {
    const acoes = document.querySelectorAll('[data-action]');
    
    acoes.forEach((action) => {
      switch (action.dataset.action) {
        case "clear-all-ls":
          $(action).on("click", (event) => {
            event.preventDefault();
            if (confirm("Você tem certeza que deseja apagar todos os formulário armazenados? Isso é irreversível.")) {
              const formsInst = new Forms();
              formsInst.clearAll();
              window.location.reload();
            }
          })
          break;
        
        case 'acao':
          break;
        
        case 'editar':
          try {
            $(action).on('click', (event) => {
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
          $(action).on('click', (event) => {
            event.preventDefault();
            (action.closest('dialog')).close();
          });
          break;
        
        case 'formulario-editar-informacoes':
          $(action).on('submit', (event) => {
            event.preventDefault();
            send(event.target);
          });
          break;
        
        case 'carregar-com-espelho':
          $(action).on('click', () => {
            $('#pdf-upload').click();
            
            // if (true) alert("O conteúdo foi recuperado com sucesso! Confira se as informações estão corretas e de acordo com o que você precisa")
            // else alert("Não obtivemos nenhum dado do arquivo")
          })
          
          // Clica em um input file e o usuário faz upload do arquivo
          // Verifica se o arquivo é de fato um PDF e transforma em base64 para a lib conseguir ler
          // Envia o conteudo do PDF para a lib e retorna os dados que foram obtidos via regex
          // Sanitiza e insere os dados no formulario - usa a funcao send
          break;
        
        case 'access-clipboard':
          // Botão que busca da área de transferência
          $(action).on('click', async () => {
            try {
              const text = await navigator.clipboard.readText();
              writeInputs(text);
            } catch (err) {
              console.info('Erro ao acessar a área de transferência.');
              console.info(err);
            }
          });
          break;
        
        case "registros-recuperados":
          $(action).on("click", () => {
            const modal = $("#modal-registros");
            const tableBodyModal = $("#modal-registros-table-body");
            let htmlAcc = ``;
            
            // Limpa o conteúdo anterior da tabela e remove quaisquer listeners antigos.
            tableBodyModal.empty();
            tableBodyModal.off("click"); // Garante que não haja listeners duplicados de cliques anteriores.
            
            const cs = new Forms();
            const ids = new Set(); // Usar um Set é mais eficiente para verificar a existência de um ID.
            
            const formsParaExibir = [...cs.getFormsArmazenados()].toReversed().toSpliced(100);
            
            formsParaExibir.forEach(formItem => {
              if (ids.has(formItem.id)) return;
              ids.add(formItem.id);
              
              htmlAcc += `
                <tr>
                  <!-- <td>${formItem.id.toString().slice(-6, -1)}</td> -->
                  <td><a role="button" onclick="navigator.clipboard.writeText('${formItem?.["CPF"]?.["0"] ?? ""}').then(() => {})" tabindex="-1" title="Clique para copiar">${formItem?.["CPF"]?.["0"] ?? ""}</a></td>
                  <td><a role="button" onclick="navigator.clipboard.writeText('${formItem?.["contractNumber"] ?? ""}').then(() => {})" tabindex="-1" title="Clique para copiar">${formItem?.["contractNumber"] ?? ""}</a></td>
                  <td><a role="button" onclick="navigator.clipboard.writeText('${formItem?.["saveDate"] ?? ""}').then(() => {})" tabindex="-1" title="Clique para copiar">${formItem?.["saveDate"] ?? ""}</a></td>
                  <td>
                    <div class="d-flex items-center justify-center flex-wrap gap-1">
                      <button data-id="${formItem.id}" data-actionX="print" type="button" class="btn-normal btn-primary block w-auto">Imprimir</button>
                      <button data-id="${formItem.id}" data-actionX="edit" type="button" class="btn-normal btn-warning block w-auto">Editar</button>
                      <button data-id="${formItem.id}" data-actionX="delete" type="button" class="btn-normal btn-danger block w-auto">Apagar</button>
                    </div>
                  </td>
                </tr>
              `;
            });
            
            if (formsParaExibir.length === 0) htmlAcc = `<tr><td colspan="4">Nenhum formulário foi encontrado.</td></tr>`
            
            // Adiciona todo o HTML gerado ao corpo da tabela de uma só vez.
            tableBodyModal.html(htmlAcc);
            
            // Delegação de Eventos: Adiciona um único event listener ao pai (tableBodyModal).
            tableBodyModal.on("click", "button", function (e) {
              e.preventDefault();
              const target = $(this);
              const btnId = target.data("id");
              const btnAction = target.data("actionx");
              
              if (!btnId || !btnAction) {
                alert("Algo não saiu como deveria... Contate o administrador.");
                return;
              }
              
              if (btnAction === "edit" || btnAction === "print") {
                const formEncontrado = cs.find(btnId);
                
                if (formEncontrado) {
                  setAllFields(formEncontrado);
                  modal?.[0]?.close();
                  setTimeout(() => {
                    if (btnAction === "edit") $("#modal-editar-informacoes")?.[0]?.showModal();
                    // Botão de impressão do formulário, dentro do modal de editar informações
                    else $("#modal-editar-informacoes form button[type=submit]")?.[0]?.click();
                  }, 500);
                } else alert("Nenhum registro foi encontrado para o id fornecido. Tente novamente.");
                
              } else if (btnAction === "delete") {
                cs.remove(btnId);
                alert("Registro removido com sucesso!");
                window.location.reload();
              }
            });
            
            // Mostra o modal.
            modal?.[0]?.showModal();
          });
          break;
        
        default:
          console.warn('A ação não foi implementada.');
          break;
      }
    });
  }
  
  function attributeMask(param, input) {
    if (isEmpty(param) && isEmpty(input)) {
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
          $(input).mask('0000', {reverse: true});
          break;
        
        case 'operacao':
          $(input).mask('0000', {reverse: true});
          break;
        
        case 'cpf':
          $(input).mask('000.000.000-00', {reverse: true});
          break;
        
        case 'numero-contrato':
          $(input).mask('0.0000.0000000-0', {reverse: true});
          break;
        
        case 'conta':
          $(input).mask('000000000000-0', {reverse: true});
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
  
  const replaceNullForZero = (str, length, cursor) => {
    let allZeros = "";
    let result;
    
    for (let i = 0; i < length; i++) {
      allZeros += "0"
    }
    
    result = allZeros;
    if (cursor === "right") result = str + result;
    else result += str;
    
    return result.slice(-length);
  }
  
  let iterate = 0;
  const writeInputs = (value) => {
    let parts = value.trim().split('.').map(v => v.replace(/\D/g, ""));
    if (parts.length === 1) parts = value.trim().split(" - ");
    if (parts.length === 1) parts = value.trim().split("-");
    
    if ((parts.length === 3 || parts.length === 4) && parts.join('').match(/\d/g).length) {
      iterate = 0;
      const part2 = parts[2]?.match(/\d/g)?.join("");
      const part3 = parts[3]?.match(/\d/g)?.join("");
      
      $('#cc_agencia').val(parts[0].substring(0, 4));
      $('#cc_operacao').val(parts[1].substring(0, 4));
      $('#cc_numero').val(value?.match(/-/g)?.join("").length > 1 ? replaceNullForZero(part2.substring(0, part2.length - 1), 12, "left") + "-" + (part3 || part2.substring(part2.length - 1, part2.length)) : (replaceNullForZero(part2.substring(0, part2.length - 1), 12, "left") + "-" + part2.substring(part2.length - 1, part2.length)) || "");
    } else if (iterate === 0) alert('Formato inválido. Use o padrão: 0000.0000.000000000000-0');
    else {
      $('#cc_agencia').val(parts.join("").substring(0, 4));
      $('#cc_operacao').val(parts.join("").substring(4, 4 + 4));
    }
    iterate += 1;
  }
  
  const beforePrint = () => {
    $('#controle').hide();
  };
  
  const afterPrint = () => {
    $('#controle').show();
  };
  
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
    
    const input = document.getElementById('pdf-upload');
    
    input.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      if (file.type !== "application/pdf") {
        alert("O arquivo não é um PDF. Selecione um PDF e tente novamente");
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = async () => {
        // CORREÇÃO: Use reader.result em vez de this.result
        const typeResArray = new Uint8Array(reader.result);
        
        try {
          const loadingTask = pdfjsLib.getDocument({data: typeResArray});
          const pdf = await loadingTask.promise;
          let fullText = '';
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + '\n'; // Adicionado \n para separar o texto das páginas
          }
          
          /**
           * Get the context using regex
           *
           * @param {String} text The text to be searched
           * @param {RegExp} regex The regex to be used
           * @param {RegExp} regexSanit The regex to be sanitized
           * @param {Number|Null} index The index of the array
           * @returns {string|null} The content between the two strings or an empty array
           **/
          const getContextUsingRegex = (text, regex, regexSanit, index = null) => {
            // Verificação e tratamento para textos obtidos no Firefox
            
            // TODO - Implementar verificação se algo foi obtido. Falha ocorre para arquivos de espelhos obtidos do Firefox e que podem ser lidos em outro navegador. ## Solução encontrada aumentando o tempo de espera para carregamento do PDF com a complexidade do regex
            // Percorre os textos (do regex para captura e do regex para sanitização) e adiciona \s* após cada caractere exceto os caracteres especiais
            try {
              [regex, regexSanit].forEach((r, index) => {
                let new_regex = r.toString().replace('/', '').replace(/\/gi/g, '');
                new_regex = new_regex.split('').map((e, i) => {
                  const this_ = new_regex.split('');
                  if (e === '\\' || e === '/') return e;
                  if (['w', 's', 'i', 'g', 'b', 'd', 'r'].includes(e.toLowerCase()) && this_[i - 1] === '\\') return e;
                  if ([','].includes(e) && this_[i + 1] === '}') return e;
                  if (e.match(/\d+/g) !== null && this_[i - 1] === '{' && this_[i + 1] === ',') return e;
                  if (['*', '?', '+', ']', '[', '(', ')', '{', '}', '^'].includes(e)) return e;
                  if (e.match(/\d/g) !== null && this_[i - 1] === '{' && this_[i + 1] === '}') return e;
                  if (['*', '?', '^', '+'].includes(this_[i + 1])) return e;
                  return e + '\\s*';
                }).join('');
                index === 0 ? regex = new RegExp(new_regex, 'gi') : regexSanit = new RegExp(new_regex, 'gi');
              });
            } catch (error) {
              console.groupCollapsed(`Erro: ${error.message}`);
              console.info(`${error.message}`);
              console.info(error.stack);
              console.groupEnd();
              return null;
            }
            
            try {
              if (!new RegExp(regex).test(text)) return null;
              if (!index && index !== 0) return text.match(new RegExp(regex)).map((p) => p.replace(new RegExp(regexSanit), '').trim());
              else return text.match(new RegExp(regex)).map((p) => p.replace(new RegExp(regexSanit), '').trim())[index];
            } catch (e) {
              return null;
            }
          }
          
          /**
           * Get the account number
           *
           * @param {Array} ret The text to be searched
           * @param {Number} index The index of the array
           * @returns {string|null} The content between the two strings or an empty array
           **/
          const getAccount = (ret, index) => {
            try {
              if (ret) {
                const account = Array.isArray(ret) ? ret[0].split('-') : ret.split('-');
                return account[index];
              } else {
                return null;
              }
            } catch (e) {
              return '';
            }
          }
          
          /**
           * Sanitize the regex return, replacing values
           *
           * @param str
           * @param regex
           * @param action
           * @param replaceValue
           * @returns {*|null}
           */
          const sanitizeRegexReturn = (str, regex, action, replaceValue) => {
            try {
              if (action === 'replace') return str.replace(regex, replaceValue);
              return str.match(regex)[0];
            } catch (e) {
              return null;
            }
          }
          
          // const regex = {
          //   cpf: /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
          //   // Dados das contas
          //   // [números e traços]
          //   account: /\d{4}-\d{3,4}-\d{12}-\d/g,
          //   // Outros dados
          //   // [números, espaços e letras]
          //   general: /[\d\D]+/g,
          // }
          //
          // const regexes = [
          //   ["name", "regex", ""]
          // ]
          
          // Sanitizando todo o conteúdo obtido do PDF - removendo espaços desnecessários
          const text = fullText.replace(/\s+,/g, ',').replace(/\s+/g, ' ').trim();
          
          // Imprime o texto do PDF no console para auditoria
          console.groupCollapsed('Texto do PDF - Auditoria' + ' - ' + new Date().toLocaleString());
          console.log(text);
          console.groupEnd();
          
          // Obtendo os dados do texto do PDF
          try {
            const data = {
              clients: {
                CPF: {content: getContextUsingRegex(text, /(CPF:)\s\d{3}\.\d{3}\.\d{3}-\d{2}\s(Nome)/gi, /(CPF:)|Nome/gi), ref: ["CPF_1", "CPF_2", "CPF_3", "CPF_4"]}
              },
              contract: {content: getContextUsingRegex(text, /(Número Contrato para Administração:)\s\d\.\d{4}\.\d{7}-\d\s*Situação/gi, /(Número Contrato para Administração:)|Situação/gi, 0), ref: "n_contrato"},
              // Conta para débito das parcelas
              debit_account: {
                agency: {content: getAccount(getContextUsingRegex(text, /(Conta para Débito:)\s(\d{4}-\d{3,4}-\d{12}-\d)\s(Débito em Conta)/gi, /(Conta para Débito:)|(Débito em Conta)/gi), 0), ref: "cc_agencia"},
                operation: {content: getAccount(getContextUsingRegex(text, /(Conta para Débito:)\s(\d{4}-\d{3,4}-\d{12}-\d)\s(Débito em Conta)/gi, /(Conta para Débito:)|(Débito em Conta)/gi), 1), ref: "cc_operacao"},
                account_number: {content: getAccount(getContextUsingRegex(text, /(Conta para Débito:)\s(\d{4}-\d{3,4}-\d{12}-\d)\s(Débito em Conta)/gi, /(Conta para Débito:)|(Débito em Conta)/gi), 2), ref: "cc_numero"},
                code: {content: getAccount(getContextUsingRegex(text, /(Conta para Débito:)\s(\d{4}-\d{3,4}-\d{12}-\d)\s(Débito em Conta)/gi, /(Conta para Débito:)|(Débito em Conta)/gi), 3), ref: "append_code"},
              },
            };
            
            // Imprime dados sanitizados no console
            console.groupCollapsed('Dados obtidos e sanitizados - Auditoria' + ' - ' + new Date().toLocaleString());
            const consoleReturn = {};
            for (const [key, value] of Object.entries(data)) {
              consoleReturn[key] = value;
            }
            console.log(consoleReturn)
            console.groupEnd();
            
            Object.entries(data).forEach(([key, value]) => {
              // Elementos de CPF
              if (key === "clients" && Object.keys(value)[0] === "CPF") {
                Object.values(value.CPF.content).forEach((c, i) => c.length === 14 ? $(`[data-input="CPF_${i + 1}"]`).val(c) : "")
                return true
              }
              
              // Os dados da conta
              else if (key === "debit_account") {
                Object.values(value).forEach(obj => {
                  // No caso de digito verificador - code
                  if (obj?.ref === "append_code" && obj?.content) {
                    const inputCCNumero = $(`[data-input="cc_numero"]`)
                    $(inputCCNumero).val(inputCCNumero.value += obj.content)
                    return true
                  }
                  
                  if (obj?.content) $(`[data-input="${obj.ref}"]`).val(obj.content)
                })
                return true
              }
              if (value.content) $(`[data-input="${value.ref}"]`).val(value.content)
            })
            
            const dialog = document.querySelector('#modal-editar-informacoes')
            dialog.showModal();
            const emptyInput = Array.from(dialog.querySelectorAll('input[required]')).find(input => !input.value)
            if (emptyInput && false) emptyInput.focus()
            else send($(dialog).find('form')[0]);
            //
          } catch (e) {
            alert("Ocorreu um erro ao ler o arquivo. Tente novamente. Verifique o console.");
            // console.info(e.message);
            console.error(e);
            return false;
          }
          
        } catch (error) {
          console.error("Erro ao processar o PDF:", error);
          alert("Ocorreu um erro ao tentar ler o arquivo PDF.");
        }
      };
      
      reader.onerror = () => {
        console.error("Erro ao ler o arquivo.");
        alert("Não foi possível ler o arquivo selecionado.");
      };
      
      reader.readAsArrayBuffer(file);
    });
    
    // Monitora os inputs para quando haver uma colagem de conteudo, separar e adicionar os valores aos seus respectivos campos
    $('#cc_agencia, #cc_operacao, #cc_numerocc_numero').on('paste', (e) => {
      e.preventDefault();
      const pasteText = (e.originalEvent || e).clipboardData.getData('text/plain');
      writeInputs(pasteText);
    });
    
    $('.btn-impressao').on('click', (event) => {
      event.preventDefault();
      window.print();
    });
  });
  
  if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');
    
    mediaQueryList.addEventListener('change', (event) => {
      if (event.matches) {
        beforePrint();
      } else {
        afterPrint();
      }
    });
  }
  
  window.onbeforeprint = beforePrint;
  window.onafterprint = afterPrint;
  
  // Ativar modal editar informações
  document.addEventListener('keyup', (evento) => {
    if (!isEmpty(evento.keyCode)) {
      if (evento.keyCode === 45) {
        showModalEditInfos();
      }
    }
  });
  
  console.log(`Mode: ${MODE === 1 ? "Production" : "Development"}`, `Origin: ${window.location.origin}`, `Started: ${new Date()}`)
})();
