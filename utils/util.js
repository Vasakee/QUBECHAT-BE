const getServerAddress = (req) => {
    return req.protocol + '://' + req.get('host')
}

module.exports = {getServerAddress}