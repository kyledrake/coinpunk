var Controller = function (root, express, db) {
  this.db = db;

  if (!express) {
    return;
  }

  // Set up RESTful routes.
  express.post(root, this._create.bind(this));
  express.post([root, 'search'].join('/'), this._search.bind(this));
  express.get([root, ':id'].join('/'), this._read.bind(this));
  express.get(root, this._list.bind(this));
  express.put([root, ':id'].join('/'), this._update.bind(this));
  express.delete([root, ':id'].join('/'), this._delete.bind(this));
};

/**
 * Returns an error message to the JS client.
 */
Controller.prototype.errorResponse = function (errors) {
  if(typeof errors == 'string')
    errors = [errors];
  return {messages: errors};
};

Controller.prototype.notFound = function(req, res) {
  res.send(404);
};

// Method stubs. All 404 by default.
Controller.prototype._create = Controller.prototype.notFound; 
Controller.prototype._search = Controller.prototype.notFound; 
Controller.prototype._read = Controller.prototype.notFound; 
Controller.prototype._list = Controller.prototype.notFound; 
Controller.prototype._update = Controller.prototype.notFound; 
Controller.prototype._delete = Controller.prototype.notFound; 

module.exports.Controller = Controller;
