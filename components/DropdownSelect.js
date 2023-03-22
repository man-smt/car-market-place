import { useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'

const DropdownSelect = ({
  defaultValue,
  options,
  icon,
  variant,
  darkMenu,
  searchSelectData,
  setSearchSelectData,
  name,
  ...props
}) => {
  const iconEl = icon ? <i className={`${icon} me-2`}></i> : ''

  let obj = { ...searchSelectData }
  const handleSelect = (eventKey, e) => {
    obj[name] = eventKey?.toLowerCase()
    setSearchSelectData(obj)
  }

  return (
    <Dropdown {...props} onSelect={handleSelect}>
      <Dropdown.Toggle variant={variant ? variant : 'link'} id={name}>
        {iconEl}
        {searchSelectData[name] ? searchSelectData[name] : defaultValue}
      </Dropdown.Toggle>
      <Dropdown.Menu variant={darkMenu ? 'dark' : ''}>
        {options
          ? options.map((option, indx) => (
              <Dropdown.Item key={indx} eventKey={option[1]}>
                {option[0] && (
                  <i className={`${option[0]} fs-lg opacity-60 me-2`}></i>
                )}
                {option[1]}
              </Dropdown.Item>
            ))
          : ''}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default DropdownSelect
