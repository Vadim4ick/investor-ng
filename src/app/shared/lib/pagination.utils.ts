export type PaginationView = {
  pages: number[];
  showLeftEllipsis: boolean;
  showRightEllipsis: boolean;
};

export function buildPagination(
  current: number,
  totalPages: number,
  maxVisible = 5,
): PaginationView {
  if (totalPages <= 0) {
    return {
      pages: [],
      showLeftEllipsis: false,
      showRightEllipsis: false,
    };
  }

  if (totalPages <= maxVisible) {
    return {
      pages: Array.from({ length: totalPages }, (_, i) => i + 1),
      showLeftEllipsis: false,
      showRightEllipsis: false,
    };
  }

  let start = Math.max(1, current - 2);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return {
    pages,
    showLeftEllipsis: pages[0] > 2,
    showRightEllipsis: pages[pages.length - 1] < totalPages - 1,
  };
}
