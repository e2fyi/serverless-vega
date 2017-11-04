'use strict';

const handleVega = require('./lib/render-vega');

exports.vg = (req, res) => {
  switch (req.method) {
    case 'GET':
      handleVega(req.query)
        .then(({mime, body}) => {
          res.set('Content-Type', mime);
          res.status(200).send(body);
        })
        .catch(error => {
          res.status(400).send({error});
        });
      break;
    default:
      res.status(500).send({error: 'Invalid request!'});
      break;
  }
};
