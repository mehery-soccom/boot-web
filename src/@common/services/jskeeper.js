
var jskeeper  = {
  nextCache : {},
  async first (func,key){
      if(!this.nextCache[key]){
          this.nextCache[key] = func();
          let resp = await this.nextCache[key];
          delete this.nextCache[key];
          return resp;
      }
      return await this.nextCache[key];
  }
};

export default jskeeper;