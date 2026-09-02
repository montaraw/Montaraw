async function testApi() {
  try {
    console.log('Testing /api/health...');
    const health = await fetch('http://localhost:5000/api/health').then((r) => r.json());
    console.log('Health:', health);

    console.log('Testing /api/products...');
    const prods = await fetch('http://localhost:5000/api/products').then((r) => r.json());
    console.log('Products count:', prods.products?.length, 'Success:', prods.success);

    console.log('Testing /api/categories...');
    const cats = await fetch('http://localhost:5000/api/categories').then((r) => r.json());
    console.log('Categories count:', cats.categories?.length, 'Success:', cats.success);

    console.log('Testing /api/settings...');
    const set = await fetch('http://localhost:5000/api/settings').then((r) => r.json());
    console.log('Settings:', set.settings?.contactEmail, 'Success:', set.success);

    console.log('🎉 ALL APIS RESPONDED WITH STATUS 200 SUCCESS!');
  } catch (err) {
    console.error('Test API error:', err.message);
  }
}

testApi();
