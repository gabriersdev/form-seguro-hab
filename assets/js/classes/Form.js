export default class Form {
  _id = 0;
  _CPF1 = "";
  _CPF2 = "";
  _CPF3 = "";
  _CPF4 = "";
  _contractNumber = "";
  _agencyNumber = "";
  _operationNumber = "";
  _accountNumber = "";
  _cityName = "";
  _signDate = "";
  _saveDate = "";
  
  constructor ($data) {
    if ($data?.["id"]) this._id = $data["id"];
    else this._id = Math.round(Math.random() * 101) + new Date().getTime();
    this.setAll($data);
  }
  
  setAll($data) {
    this._CPF1 = $data["CPF1"] ?? $data?.["CPF"]?.["0"] ?? "";
    this._CPF2 = $data["CPF2"] ?? $data?.["CPF"]?.["1"] ?? "";
    this._CPF3 = $data["CPF3"] ?? $data?.["CPF"]?.["2"] ?? "";
    this._CPF4 = $data["CPF4"] ?? $data?.["CPF"]?.["3"] ?? "";
    
    this._contractNumber = $data["contractNumber"] ?? "";
    this._agencyNumber = $data["agencyNumber"] ?? "";
    this._operationNumber = $data["operationNumber"] ?? "";
    this._accountNumber = $data["accountNumber"] ?? "";
    this._cityName = $data["cityName"] ?? "";
    this._signDate = $data["signDate"] ?? "";
    
    this._saveDate = $data["saveDate"] ?? new Date().toLocaleString("pt-br", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    })
  }
  
  getAll() {
    return {
      id: this._id,
      CPF: [this._CPF1, this._CPF2, this._CPF3, this._CPF4],
      contractNumber: this._contractNumber,
      agencyNumber: this._agencyNumber,
      operationNumber: this._operationNumber,
      accountNumber: this._accountNumber,
      cityName: this._cityName,
      signDate: this._signDate,
      saveDate: this._saveDate
    }
  }
  
  toString() {
    return `<<Instância da capa - id: ${this._id}>>`;
  }
  
  [Symbol.for('util.inspect.custom')]() {
    return `<<Instância da capa - id: ${this._id}>>`;
  }
}