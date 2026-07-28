async function callDeleteRoute(id) {
    try {
        // to execute on localhost: uncomment lines 4 to 6 and comment lines 7 to 9
        //  const response = await fetch(`http://localhost:5000/articles/${id}`, {
        //     method: 'DELETE'
        // });
        const response = await fetch(`https://md-knowledgebase-app.vercel.app/articles/${id}`, {
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