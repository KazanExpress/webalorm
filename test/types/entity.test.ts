import { Connection } from '../../src';
import { Broken, Product, ProductApiMap, User, UserApiMap } from '../common/models';

describe('types', () => {
  it('types', async () => {
    Connection.$debug(true);


    const orm = new Connection('asd', [], {
      Products: Product,
      User,
      Broken
    }, {
      User: new UserApiMap(),
      Products: new ProductApiMap(),
      Broken: {
        async create() {
          return Promise.resolve(new Broken());
        },
        async delete() {
          return Promise.resolve(new Broken());
        },
        async update() {
          return Promise.resolve(new Broken());
        },
      }
    });

    const podguznik = {
      id: 0,
      title: 'podguznik',
      url: '/products'
    };

    orm.Products.add(podguznik, 'asdasd');
    orm.Products.add(podguznik, false);

    orm.Products.get(0);

    try {
      orm.Products.update({
        id: 0,
        title: 'Cool Podguzninki for cool kids!'
      });
    } catch (e) { }

    try {
      orm.Products.updateById(0, product => ({
        url: `/products/${product.id}`
      }));
    } catch (e) { }

    try {
      orm.Products.delete(0);
    } catch (e) { }

    expect(orm.User.name).toBe('User');

    try {
      orm.User.create({
        name: 'max',
        birthDate: new Date,
        cart: []
      }, {
        username: 'max',
        password: 'sadasdasd'
      });
    } catch (e) { }

    try {
      orm.User.update({
        cart: [
          (await orm.Products.get(0)).result!
        ]
      });
    } catch (e) { }

    try {
      orm.User.delete();
    } catch (e) { }

    expect(typeof orm.Broken.name).toBe('string');
    expect(orm.Broken.name).toBe('Broken');

    expect(await orm.Broken.API.create()).toMatchObject(new Broken());
  });
});
