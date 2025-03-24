// Initialize Supabase client
const supabase = supabase.createClient(
    'https://kdrkwwazwtuvlfqhjefe.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkcmt3d2F6d3R1dmxmcWhqZWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDk5OTMsImV4cCI6MjA1ODA4NTk5M30.qNgjoewVW8f1T4MhJOObs6-LkikxVsqO4PCkp9OeW4o'
);

// Add new category to the database
async function addCategory() {
    const categoryName = document.getElementById('newCategoryName').value;
    const categoryPosition = document.getElementById('newCategoryPosition').value;

    if (!categoryName || !categoryPosition) {
        alert('Please fill out the category name and position!');
        return;
    }

    const { data, error } = await supabase
        .from('category')
        .insert([{ name: categoryName, position: categoryPosition }])
        .select();

    if (error) {
        document.getElementById('status').innerText = `Error adding category: ${error.message}`;
        return;
    }

    // Refresh category list
    loadCategories();
    document.getElementById('status').innerText = "Category added successfully!";
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryPosition').value = '';
}

// Load and display categories in dropdown and as a list
async function loadCategories() {
    const { data: categories, error } = await supabase.from('category').select('*').order('position');
    if (error) {
        alert(`Error fetching categories: ${error.message}`);
        return;
    }

    // Refresh the category dropdown
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.innerHTML = '';
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });

    // Refresh the category list for drag-and-drop
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = ''; // Clear existing list

    categories.forEach((cat, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = cat.name;
        listItem.setAttribute('data-id', cat.id);
        categoryList.appendChild(listItem);
    });

    // Enable drag-and-drop reordering
    new Sortable(categoryList, {
        onEnd: async function (evt) {
            const reorderedCategoryIds = Array.from(categoryList.children).map((li) => li.getAttribute('data-id'));
            
            // Update positions in database
            for (let i = 0; i < reorderedCategoryIds.length; i++) {
                const { error } = await supabase
                    .from('category')
                    .update({ position: i + 1 })
                    .eq('id', reorderedCategoryIds[i]);
                
                if (error) {
                    alert(`Error updating category position: ${error.message}`);
                    return;
                }
            }

            alert('Categories reordered successfully!');
        }
    });
}

// Add content (Dua/Ziyarat/Namaz/Aamal)
async function addContent() {
    const categoryId = document.getElementById('categorySelect').value;
    const contentName = document.getElementById('contentName').value;
    const contentText = document.getElementById('contentText').value;
    const contentTranslation = document.getElementById('contentTranslation').value;

    if (!categoryId || !contentName || !contentText || !contentTranslation) {
        alert('Please fill out all fields!');
        return;
    }

    const { data, error } = await supabase
        .from('content')
        .insert([{
            category_id: categoryId,
            name: contentName,
            text: contentText,
            translation: contentTranslation
        }])
        .select();

    if (error) {
        alert(`Error adding content: ${error.message}`);
        return;
    }

    alert('Content added successfully!');
    document.getElementById('contentName').value = '';
    document.getElementById('contentText').value = '';
    document.getElementById('contentTranslation').value = '';
}

// Initialize the page with categories
window.onload = loadCategories;
