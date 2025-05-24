function showContent(section) {
    // Hide all content
    var contents = document.querySelectorAll('.content');
    contents.forEach(function(content) {
        content.style.display = 'none';
    });

    // Show the selected section
    var selectedContent = document.getElementById(section);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    if (section === 'Map' && typeof map !== 'undefined') {
      setTimeout(() => {
        map.invalidateSize();
      }, 200); // short delay allows CSS to finish showing the element
    }
}
// Show the default content (Home) when the page loads
document.addEventListener("DOMContentLoaded", function() {
    showContent('home'); // Show the home content by default
});