import { faker } from '@faker-js/faker/locale/en_US';


export const generateUser = () => ({
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    username: faker.internet.userName(),
    email: faker.internet.email()
});

export const generateToDo = (userId) => {
    let choises = Array.of(true, false)
    let randIndex = Math.floor(Math.random()*choises.length)
    return {
        userId: userId,
        title: `ToDo ${faker.lorem.words()}`,
        completed: choises[randIndex]
    }
}
