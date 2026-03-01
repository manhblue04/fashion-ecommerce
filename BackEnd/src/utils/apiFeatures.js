class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query
    this.queryStr = queryStr
  }

  search() {
    const keyword = this.queryStr.keyword
      ? { name: { $regex: this.queryStr.keyword, $options: 'i' } }
      : {}
    this.query = this.query.find(keyword)
    return this
  }

  filter() {
    const queryCopy = { ...this.queryStr }
    const removeFields = ['keyword', 'page', 'limit', 'sort', 'gender', 'size', 'color', 'brand']
    removeFields.forEach((key) => delete queryCopy[key])

    let queryStr = JSON.stringify(queryCopy)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    this.query = this.query.find(JSON.parse(queryStr))
    return this
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  paginate(limit) {
    const page = parseInt(this.queryStr.page, 10) || 1
    const perPage = parseInt(this.queryStr.limit, 10) || limit || 12
    const skip = (page - 1) * perPage
    this.query = this.query.skip(skip).limit(perPage)
    return this
  }
}

module.exports = ApiFeatures
