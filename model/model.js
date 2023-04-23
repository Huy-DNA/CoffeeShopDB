const sql = require('mssql')

const config = {
    port: parseInt(process.env.DB_PORT, 10),
    server: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    stream: false,
    options: {
        trustedConnection: true,
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
    },
}

class Query {
    #from = []
    #select = []
    #where = []
    #orderby = []

    constructor(from, select, where, orderby) {
        this.#from = from
        this.#select = select
        this.#where = where
        this.#orderby = orderby
    }

    sanitize(value) {
        value = value.toString()
        const regex = new RegExp(/^[\d\s\w\-%_\'\"\\:/+,.]+$/)
        if (!regex.test(value))
            throw `Invalid characters encountered in input string: '${value}'`
        let escapedString = value.replace(/\\/g, '\\\\')
                                 .replace(/--/g, '\\--')
                                 .replace(/\'/g, '\\\'')
                                 .replace(/\"/g, '\\\"')
        return escapedString
    }

    from(table) {
        return new Query(table, this.#select, this.#where, this.#orderby)
    }

    select(attributes) {
        return new Query(this.#from, attributes, this.#where, this.#orderby)
    }

    whereValue(attribute, op, value) {
        const sanitizedValue = this.sanitize(value)

        const newWhere = [...this.#where]
        newWhere.push([attribute, op, `'${sanitizedValue}'`])

        return new Query(this.#from, this.#select, newWhere, this.#orderby)
    }

    whereAttribute(attribute1, op, attribute2) {
        const newWhere = [...this.#where]
        newWhere.push([attribute1, op, attribute2])

        return new Query(this.#from, this.#select, newWhere, this.#orderby)
    }

    orderby(attributes) {
        return new Query(this.#from, this.#select, this.#where, attributes)
    }
    
        

    constructQuery() {
        let query = `SELECT ${this.#select.join(',')}
                     FROM ${this.#from.join(',')}
                     `
        if (this.#where.length !== 0)
            query += `WHERE ${this.#where.map(triple => `${triple[0]} ${triple[1]} ${triple[2]}`)
                                         .join(' AND ')}
                     `
        if (this.#orderby.length !== 0)
            query += `ORDER BY ${this.#orderby.join(',')}`
        
        return query
    }

    async query() {
        return sql.connect(config).then(pool => pool.query(this.constructQuery()))
                                  .then(result => result.recordset)
    }

    constructInsert(value) {
        const entries = Object.entries(value)
        const sanitizedEntries = entries.map(entry => [entry[0], this.sanitize(entry[1])])

        return `INSERT INTO ${this.#from[0]} (${sanitizedEntries.map(entry => entry[0]).join(',')}) VALUES
                    (${sanitizedEntries.map(entry => `'${entry[1]}'`).join(',')})`
    }

    async insert(value) {
        return sql.connect(config).then(pool => pool.query(this.constructInsert(value)))
    }

    async execTableFunc(functionName, ...params) {
        params = params.map(this.sanitize).map(param => `'${param}'`)
        return sql.connect(config).then(pool => pool.query(`SELECT * 
                                                            FROM dbo.${functionName}(${params.join(',')})`))
                                  .then(res => res.recordset)
    }
}

module.exports = new Query('', [], [], [])