const Sequelize = require('sequelize')
const Op = Sequelize.Op
const PLAIN = {plain: true}
const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
})


const Product = sequelize.define('product', {
  title: Sequelize.STRING,
  users: Sequelize.DataTypes.JSONB
});
const User = sequelize.define('user', {
  first_name: Sequelize.STRING,
  last_name: Sequelize.STRING
});
const Address = sequelize.define('address', {
  type: Sequelize.STRING,
  line_1: Sequelize.STRING,
  line_2: Sequelize.STRING,
  city: Sequelize.STRING,
  state: Sequelize.STRING,
  zip: Sequelize.STRING,
});

Product.User = Product.belongsTo(User);
User.Addresses = User.hasMany(Address);


const Tag = sequelize.define('tag', {
  name: Sequelize.STRING
});

Product.hasMany(Tag);


let run = async () => {
  try {
    /*
    await sequelize.sync({force: true})

    await Product.create({
      id: 2,
      title: 'Table',
      users: [1,2,3,10],
      tags: [
        { name: 'Alpha'},
        { name: 'Gama'}
      ]
    }, {
      include: [ Tag ]
    })
    */

    let p = await Product.find({
      where: {
        users: {
          [Op.contains]: 2
        }
      }
    })
    console.log(p.get(PLAIN))
  }
  catch (ex) {
    console.error(ex)
  }
  finally {
    process.exit(0)
  }
}

run()
