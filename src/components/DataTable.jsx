import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Skeleton from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';
import './DataTable.css';

/**
 * DataTable — sortable, paginated data table.
 *
 * @param {Array<{ key, label, sortable?, render?, width? }>} columns
 * @param {Array<object>} data
 * @param {boolean} loading
 * @param {string|null} error
 * @param {object} pagination — { page, totalPages, totalItems, limit, onPageChange }
 * @param {object} sort — { key, direction, onSort }
 * @param {React.ReactNode} filterSlot — filter controls rendered above the table
 * @param {string} emptyMessage
 * @param {Function} onRowClick
 * @param {string} rowIdKey — key used as the React key for rows (default: '_id')
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  error = null,
  pagination,
  sort,
  filterSlot,
  emptyMessage = 'No records found.',
  onRowClick,
  rowIdKey = '_id',
}) {
  return (
    <div className="datatable">
      {/* Filter slot */}
      {filterSlot && <div className="datatable__filters">{filterSlot}</div>}

      {/* Error state */}
      {error && (
        <div className="datatable__error" role="alert">
          <p>{error.message ?? error}</p>
        </div>
      )}

      {/* Desktop: table */}
      {!error && (
        <div className="datatable__table-wrapper">
          <table className="datatable__table" aria-busy={loading}>
            <thead className="datatable__thead">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`datatable__th${col.sortable ? ' datatable__th--sortable' : ''}`}
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={
                      sort?.key === col.key
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : col.sortable
                        ? 'none'
                        : undefined
                    }
                    onClick={col.sortable ? () => sort?.onSort(col.key) : undefined}
                    tabIndex={col.sortable ? 0 : undefined}
                    onKeyDown={
                      col.sortable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') sort?.onSort(col.key);
                          }
                        : undefined
                    }
                  >
                    <span className="datatable__th-inner">
                      {col.label}
                      {col.sortable && (
                        <span className="datatable__sort-icon" aria-hidden="true">
                          {sort?.key === col.key ? (
                            sort.direction === 'asc' ? (
                              <ChevronUp size={14} strokeWidth={2} />
                            ) : (
                              <ChevronDown size={14} strokeWidth={2} />
                            )
                          ) : (
                            <span className="datatable__sort-idle">
                              <ChevronUp size={12} strokeWidth={2} />
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="datatable__tbody">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="datatable__row datatable__row--skeleton">
                      {columns.map((col) => (
                        <td key={col.key} className="datatable__td">
                          <Skeleton variant="text" width="80%" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data.map((row) => (
                    <tr
                      key={row[rowIdKey] ?? Math.random()}
                      className={`datatable__row${onRowClick ? ' datatable__row--clickable' : ''}`}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      onKeyDown={
                        onRowClick
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') onRowClick(row);
                            }
                          : undefined
                      }
                      role={onRowClick ? 'button' : undefined}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="datatable__td">
                          {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* Empty state (not loading, no error, no data) */}
          {!loading && !error && data.length === 0 && (
            <div className="datatable__empty">
              <EmptyState
                message={emptyMessage}
                subtext="Try adjusting your filters or search terms."
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile: stacked cards */}
      {!loading && !error && data.length > 0 && (
        <div className="datatable__cards">
          {data.map((row) => (
            <div
              key={row[rowIdKey] ?? Math.random()}
              className={`datatable__card${onRowClick ? ' datatable__card--clickable' : ''}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => { if (e.key === 'Enter') onRowClick(row); }
                  : undefined
              }
              role={onRowClick ? 'button' : undefined}
            >
              {columns.map((col) => (
                <div key={col.key} className="datatable__card-row">
                  <span className="datatable__card-label">{col.label}</span>
                  <span className="datatable__card-value">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="datatable__pagination" role="navigation" aria-label="Table pagination">
          <span className="datatable__pagination-info">
            {pagination.totalItems != null
              ? `${((pagination.page - 1) * pagination.limit) + 1}–${Math.min(pagination.page * pagination.limit, pagination.totalItems)} of ${pagination.totalItems}`
              : `Page ${pagination.page} of ${pagination.totalPages}`}
          </span>

          <div className="datatable__pagination-controls">
            <button
              className="datatable__page-btn"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              aria-label="First page"
            >
              <ChevronsLeft size={16} strokeWidth={2} />
            </button>
            <button
              className="datatable__page-btn"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>

            <span className="datatable__page-indicator">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              className="datatable__page-btn"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
            <button
              className="datatable__page-btn"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              aria-label="Last page"
            >
              <ChevronsRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
