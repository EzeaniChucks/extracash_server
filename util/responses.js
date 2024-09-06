const HttpSuccess = (res, payload) =>{
    return res.status(200).json({msg:'success', payload})
}

const HttpBadRequest = (res, payload) =>{
    return res.status(400).json({msg:'failure', payload})
}

const HttpForbidden = (res, payload) =>{
    return res.status(401).json({msg:'failure', payload})
}

const HttpNotFound = (res, payload) =>{
    return res.status(404).json({msg:'failure', payload})
}

const HttpServerError = (res, payload) =>{
    return res.status(500).json({msg:'server_error', payload})
}

module.exports = {
    HttpSuccess,
    HttpNotFound,
    HttpBadRequest,
    HttpForbidden,
    HttpServerError
}