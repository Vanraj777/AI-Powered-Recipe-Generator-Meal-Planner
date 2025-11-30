import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShoppingList.css';

function ShoppingList() {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedList, setSavedList] = useState(null);

  useEffect(() => {
    generateShoppingList();
    fetchSavedList();
  }, []);

  const generateShoppingList = async () => {
    try {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));

      const response = await axios.get('/api/shopping-list/generate', {
        params: {
          start_date: weekStart.toISOString().split('T')[0],
          end_date: weekEnd.toISOString().split('T')[0]
        }
      });
      setShoppingList(response.data.shoppingList);
    } catch (error) {
      console.error('Error generating shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedList = async () => {
    try {
      const response = await axios.get('/api/shopping-list');
      if (response.data.shoppingList) {
        setSavedList(response.data.shoppingList);
      }
    } catch (error) {
      console.error('Error fetching saved list:', error);
    }
  };

  const handleToggleItem = async (itemId, checked) => {
    try {
      await axios.put(`/api/shopping-list/items/${itemId}`, { checked: !checked });
      if (savedList) {
        const updatedItems = savedList.items.map(item =>
          item.id === itemId ? { ...item, checked: !checked } : item
        );
        setSavedList({ ...savedList, items: updatedItems });
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleSaveList = async () => {
    try {
      await axios.post('/api/shopping-list', { items: shoppingList });
      alert('Shopping list saved successfully!');
      fetchSavedList();
    } catch (error) {
      console.error('Error saving list:', error);
      alert('Error saving shopping list');
    }
  };

  const displayList = savedList?.items || shoppingList;

  if (loading) {
    return <div className="loading">Generating shopping list...</div>;
  }

  return (
    <div className="shopping-list-page">
      <div className="page-header">
        <h1>Shopping List</h1>
        <div className="header-actions">
          <button onClick={generateShoppingList} className="btn btn-secondary">
            Regenerate
          </button>
          <button onClick={handleSaveList} className="btn btn-primary">
            Save List
          </button>
        </div>
      </div>

      {displayList.length === 0 ? (
        <div className="empty-state">
          <p>No items in your shopping list. Plan some meals first!</p>
        </div>
      ) : (
        <div className="shopping-list">
          {displayList.map(item => (
            <div
              key={item.id || item.ingredient_name}
              className={`shopping-item ${item.checked ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={item.checked || false}
                onChange={() => handleToggleItem(item.id, item.checked)}
                className="item-checkbox"
              />
              <div className="item-info">
                <span className="item-name">{item.ingredient_name}</span>
                <span className="item-quantity">
                  {item.total_quantity || item.quantity} {item.unit || ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="list-stats">
        <p>
          Total items: {displayList.length} | 
          Checked: {displayList.filter(item => item.checked).length} | 
          Remaining: {displayList.filter(item => !item.checked).length}
        </p>
      </div>
    </div>
  );
}

export default ShoppingList;

