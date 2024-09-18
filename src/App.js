import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap'; // Import GSAP
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './App.css';
import InputBox from './Compornts/InputBox';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const App = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [inputData, setInputData] = useState({ id: null, name: '' });
  const [items, setItems] = useState([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const listRef = useRef([]); // Ref to hold list item DOM elements
  const touchStartPos = useRef(null); // To track touch positions

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('items')) || [];
    setItems(storedItems);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  const plusIconRef = useRef(null); // Ref for FaPlus icon

  // Submit new item
  const submitData = () => {
    if (inputData.name) {
      const newItem = { id: Date.now(), name: inputData.name };
      const updatedItems = [...items, newItem];

      setItems(updatedItems);
      localStorage.setItem('items', JSON.stringify(updatedItems));
      setInputData({ name: '' });
      setShowAddModal(false);

      // GSAP fade-in animation for newly added item
      setTimeout(() => {
        gsap.fromTo(
          listRef.current[updatedItems.length - 1],
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
      }, 100);
    }
  };

  // Update item
  const updateItem = () => {
    const updatedItems = items.map((item) =>
      item.id === inputData.id ? { ...item, name: inputData.name } : item
    );
    setItems(updatedItems);
    localStorage.setItem('items', JSON.stringify(updatedItems));
    setShowUpdateModal(false);

    // GSAP highlight animation for updated item
    const updatedIndex = updatedItems.findIndex((item) => item.id === inputData.id);
    gsap.fromTo(
      listRef.current[updatedIndex],
      { backgroundColor: 'yellow' },
      { backgroundColor: 'transparent', duration: 1, ease: 'power3.out' }
    );
  };

  // Delete item with animation
  const deleteItem = (id, index) => {
    gsap.to(listRef.current[index], { scale: -1, duration: 0.3, onComplete: () => {
      const updatedItems = items.filter((item) => item.id !== id);
      setItems(updatedItems);
      localStorage.setItem('items', JSON.stringify(updatedItems));
    }});
  };

  // Handle dragging (desktop)
  const handleDragStart = (index) => setDraggedItemIndex(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    gsap.to(listRef.current[index], { scale: 1.15, duration: 0.3 });
  };
  const handleDragLeave = (index) => gsap.to(listRef.current[index], { scale: 1, duration: 0.3 });
  const handleDrop = (index) => {
    if (draggedItemIndex !== null) {
      const updatedItems = [...items];
      const [draggedItem] = updatedItems.splice(draggedItemIndex, 1);
      updatedItems.splice(index, 0, draggedItem);

      setItems(updatedItems);
      localStorage.setItem('items', JSON.stringify(updatedItems));

      gsap.to(listRef.current[index], { scale: 1, opacity: 1, duration: 0.3 });
      setDraggedItemIndex(null);
    }
  };

  // Handle touch events (mobile)
  const handleTouchStart = (e, index) => {
    setDraggedItemIndex(index);
    touchStartPos.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const touchPos = e.touches[0].clientY;
    const distance = touchPos - touchStartPos.current;
    listRef.current[draggedItemIndex].style.transform = `translateY(${distance}px)`;
  };

  const handleTouchEnd = (index) => {
    listRef.current[draggedItemIndex].style.transform = `translateY(0px)`;
    handleDrop(index);
  };

  const handleShowAdd = () => {
    // Rotate the icon before showing the modal
    gsap.to(plusIconRef.current, { rotation: 360, duration: 0.5 });
    setShowAddModal(true);
  };

  return (
    <>
      <div className="backgroundapp d-flex justify-content-center align-items-center">
        <div className="d-flex justify-content-center align-items-center">
          <ul className="list-group">
            <button className="addbutton d-flex justify-content-between" onClick={handleShowAdd}>
              <span>Add items in your list &nbsp;&nbsp;</span>
              <span><FaPlus ref={plusIconRef} /></span>
            </button>

            {items.map((item, index) => (
              <li
                key={item.id}
                ref={(el) => (listRef.current[index] = el)}
                className="list-group-item d-flex justify-content-between"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={() => handleDragLeave(index)}
                onDrop={() => handleDrop(index)}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(index)}
              >
                <span>{item.name}</span>
                <div>
                  <button className="btn btn-sm mx-2" onClick={() => {
                    setInputData({ id: item.id, name: item.name });
                    setShowUpdateModal(true);
                  }}>
                    <FaEdit style={{ color: 'green' }} size={15} />
                  </button>
                  <button className="btn btn-sm" onClick={() => deleteItem(item.id, index)}>
                    <FaTrash style={{ color: 'red' }} size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal for adding items */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add items in your list</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputBox
            label="Add name"
            type="text"
            placeholder="name"
            value={inputData.name}
            name="name"
            handleChange={handleChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={submitData}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for updating items */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputBox
            className="inputbox"
            label="Update name"
            type="text"
            placeholder="name"
            value={inputData.name}
            name="name"
            handleChange={handleChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={updateItem}>
            Update Item
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default App;
