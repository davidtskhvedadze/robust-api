const buildQuery = (baseQuery, filters, params) => {
  let query = baseQuery;
  Object.keys(filters).forEach((key) => {
    if(filters[key]) {
        params.push(filters[key]);
        query += ` AND ${key} = $${params.length}`;
    }
  })
  return query;
};

module.exports = buildQuery;