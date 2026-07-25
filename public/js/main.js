async function callDeleteRoute(id) {
    try {
        const response = await fetch(`http://localhost:3000/articles/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('Article deleted successfully.');
        } else {
            console.error('Server error:', response.status);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

// Select the element
const button = document.getElementById('article-delete');

if (button !== null) {
    button.addEventListener('click', async (event) => {
        const id = event.target.getAttribute('data-id')
        callDeleteRoute(id)
        alert('Deleting Article')
        window.location.href = '/';
    });
}