// base example = Product.find()
// bigQuery -> Object converted from url query

class WhereClause {
  constructor(base, bigQuery) {
    this.base = base;
    this.bigQuery = bigQuery;
  }

  search() {
    const searchWord = this.bigQuery.search
      ? {
          name: {
            $regex: this.bigQuery.search,
            $options: "i", // case-insensitve search
          },
        }
      : {};

    this.base = this.base.find({ ...searchWord });
    return this;
  }

  filter() {
    let copyQ = { ...this.bigQuery };

    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];

    // Convert copyQ to String so that we could convert gte & lte to $gte , $lte

    let stringCopyQ = JSON.stringify(copyQ);

    stringCopyQ = stringCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, (m) => `$${m}`);

    let jsonofModifiedCopy = JSON.parse(stringCopyQ);

    this.base = this.base.find(jsonofModifiedCopy);
    return this;
  }

  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQuery.page) {
      currentPage = this.bigQuery.page;
    }

    const skipVal = resultPerPage * (currentPage - 1);
    this.base = this.base.limit(resultPerPage).skip(skipVal);
    return this;
  }
}

module.exports = WhereClause;
