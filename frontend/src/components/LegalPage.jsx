import React from 'react'
import Title from './Title'

const LegalPage = ({ text1, text2, updatedDate, sections }) => {
  return (
    <div className='pt-8 pb-16 border-t border-beige max-w-3xl mx-auto'>
      <div className='text-center mb-2'>
        <Title text1={text1} text2={text2} />
      </div>
      {updatedDate && (
        <p className='text-center text-xs text-gray-400 mb-10'>Last updated: {updatedDate}</p>
      )}

      <div className='flex flex-col gap-8'>
        {sections.map((section, i) => (
          <div key={i}>
            <p className='font-semibold text-charcoal text-base mb-2'>{section.heading}</p>
            {Array.isArray(section.body) ? (
              <ul className='list-disc list-inside text-gray-500 text-sm leading-relaxed flex flex-col gap-1.5'>
                {section.body.map((line, j) => <li key={j}>{line}</li>)}
              </ul>
            ) : (
              <p className='text-gray-500 text-sm leading-relaxed'>{section.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LegalPage
