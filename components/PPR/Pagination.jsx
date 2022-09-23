import React from 'react'
import { Icon, Pagination, Dimmer } from 'semantic-ui-react';

export default function PaginatioCompnonet({ postPerPage, totalPosts, paginate }) {
    const pageNumbers = [];
    for (let index = 1; index < Math.ceil(totalPosts / postPerPage); index++) {
        pageNumbers.push(index)
    }
    return (
        <>
            <ul>
                <Pagination onPageChange={() => paginate(number)} defaultActivePage={1} totalPages={pageNumbers.length}> {pageNumbers.map(number =>  number )}</Pagination >
            </ul>
        </>
    )
}
