import React from 'react'



export const shortAccount = (address) => {
    const upAccount = address.toLowerCase()
    return `Account: ${(upAccount.slice(0,5) + '...' + upAccount.slice(39,44))}`
}
export const frmatAccount = (account) => {
return (
    <div > 
    <span style={{
        border:'solid yellow 2px',
        borderRadius:'10px',
        padding: '10px'
    }}>
          {shortAccount(account)}
    </span>
    </div>
)
}