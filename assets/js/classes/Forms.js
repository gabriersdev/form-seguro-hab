import Form from "./Form.js";

export default class Forms {
  _forms = [];
  _lsKey = "forms-armazenados";
  
  constructor(form) {
    if (form) this.add(form);
  }
  
  add($form) {
    if (!($form instanceof Form)) {
      throw new Error("O form precisa ser uma instância da class Form")
    }
    
    this._forms.push($form.getAll())
  }
  
  find($id) {
    return this._forms.find(c => c?.["id"] === parseInt($id, 10));
  }
  
  remove($id) {
    this._forms = this._forms.filter(c => c?.["id"] !== parseInt($id, 10));
    this._setLocalStorage();
  }
  
  clearAll() {
    this._forms = [];
    localStorage.removeItem(this._lsKey);
  }
  
  getAll() {
    return this._forms.filter((c, i, self) => self.indexOf(c) === i);
  }
  
  getFormsArmazenados() {
    let elements = [];
    this._forms = [];
    
    try {
      elements = JSON.parse(localStorage.getItem(this._lsKey) ?? "[]");
    } catch (error) {
      elements = [];
    }
    
    if (elements && elements.length > 0 && Array.isArray(elements)) {
      elements.forEach(element => {
        const capa = new Form(element);
        this.add(capa);
      });
    }
    
    return this.getAll();
  }
  
  setCapasArmazenadas($capa) {
    this.getFormsArmazenados();
    this.add($capa);
    this._setLocalStorage();
  }
  
  _setLocalStorage() {
    localStorage.setItem(this._lsKey, JSON.stringify(this._forms));
  }
}