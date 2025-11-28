export const getServerAddress = (req: any) => {
  return req.protocol + '://' + req.get('host');
};
