const DataProcessor = {

}

export default {
  DataProcessor,
  registerDataProcessor: function (name, processor) {
    DataProcessor[name] = processor
  }
}