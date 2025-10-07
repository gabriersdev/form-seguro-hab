import Capa from "./Capa.js";

export default class Capas {
  _capas = [];
  _lsKey = "capas-armazenadas";
  
  constructor($capa) {
    if ($capa) this.add($capa);
  }
  
  add($capa) {
    if (!($capa instanceof Capa)) {
      throw new Error("A capa precisa ser uma instância da class")
    }
    
    this._capas.push($capa.getAll())
  }
  
  find($id) {
    return this._capas.find(c => c?.["id"] === parseInt($id, 10));
  }
  
  remove($id) {
    this._capas = this._capas.filter(c => c?.["id"] !== parseInt($id, 10));
    this._setLocalStorage();
  }
  
  clearAll() {
    this._capas = [];
  }
  
  getAll() {
    return this._capas.filter((c, i, self) => self.indexOf(c) === i);
  }
  
  getCapasArmazenadas() {
    let elements = [];
    this._capas = [];
    
    try {
      elements = JSON.parse(localStorage.getItem(this._lsKey) ?? "[]");
    } catch (error) {
      elements = [];
    }
    
    if (elements && elements.length > 0 && Array.isArray(elements)) {
      elements.forEach(element => {
        const capa = new Capa(element);
        this.add(capa);
      });
    }
    
    return this.getAll();
  }
  
  setCapasArmazenadas($capa) {
    this.getCapasArmazenadas();
    this.add($capa);
    this._setLocalStorage();
  }
  
  _setLocalStorage() {
    localStorage.setItem(this._lsKey, JSON.stringify(this._capas));
  }
}