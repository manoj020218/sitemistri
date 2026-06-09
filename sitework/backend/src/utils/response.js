const ok  = (res, data, msg = 'Success', code = 200) =>
  res.status(code).json({ success: true,  message: msg, data });

const err = (res, msg = 'Error', code = 400) =>
  res.status(code).json({ success: false, message: msg });

module.exports = { ok, err };
