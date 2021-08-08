import * as faker from 'faker/locale/en_US';

export const generateAuthor = () => ({
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    name: faker.internet.userName(),
    email: faker.internet.email()
});