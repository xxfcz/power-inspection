const Sequelize = require('sequelize')
const Op = Sequelize.Op
const PLAIN = {plain: true}
const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
})


const Player = sequelize.define('player', {/* attributes */});
const Team  = sequelize.define('team', {/* attributes */});

Player.belongsTo(Team);

const User = sequelize.define('user', {/* attributes */}, {underscored: true})
const Company  = sequelize.define('company', {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true
  }
});

User.belongsTo(Company); // Will add company_uuid to user

let run = async () => {
  try {

    await sequelize.sync({force: true})

  }
  catch (ex) {
    console.error(ex)
  }
  finally {
    process.exit(0)
  }
}

run()
