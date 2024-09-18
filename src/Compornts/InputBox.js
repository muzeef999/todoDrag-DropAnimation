import React, { useId } from 'react'
import "../App.css"

const InputBox = ({label,type,placeholder,value,name,handleChange}) => {

    const uniqueid = useId();

  return (
    <div>
        <div>
            <label htmlFor={uniqueid}>{label}</label>
        </div>
        <input className='inputbox' type={type} id={uniqueid} placeholder={placeholder} value={value} name={name} onChange={handleChange} />
    </div>
  )
}

export default InputBox