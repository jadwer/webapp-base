// Script para debug - ejecutar en consola del browser
console.log('Current localStorage token:', localStorage.getItem('access_token'));

// Test API call with current token
fetch('http://127.0.0.1:8000/api/v1/profile', {
  headers: {
    'Accept': 'application/vnd.api+json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Profile API response:', data));

// Test creating a page
const testPageData = {
  data: {
    type: 'pages',
    attributes: {
      title: 'Test from Console',
      slug: 'test-from-console',
      html: '<div>Test HTML</div>',
      css: 'div { color: red; }',
      json: {},
      publishedAt: null
    }
  }
};

fetch('http://127.0.0.1:8000/api/v1/pages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/vnd.api+json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  },
  body: JSON.stringify(testPageData)
})
.then(r => r.json())
.then(data => console.log('Create page response:', data));