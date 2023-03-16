"use client";

import { dehydrate, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { inferRouterOutputs } from "@trpc/server";
import { format } from "date-fns";
import Link from "next/link";
import { useMemo, useState, type FC } from "react";
import type { AppRouter } from "~/server/routers/_app";
import { api } from "~/trpc/client/trpc-client";
import { ChevronLeftIcon, ChevronRightIcon, SpinnerIcon } from "./icons";
import { Button } from "./ui/button";
import { cn } from "./ui/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Row {
  title: string;

  created_at: Date;

  /** the slug of the file, not the full path to the file's page */
  slug: string;
}

const convertDataToRow = async (
  item: inferRouterOutputs<AppRouter>["example"]["getInfinitePosts"]["items"][number],
) => {
  const row: Row = {
    title: item.title,
    slug: item.slug,
    created_at: item.created_at,
  };
  return row;
};

export interface Props {
  pageSizes: number[];
  initialPageSize: number;
}

/** @todo option to sort ascending by time and ability to search, once the user has decrypted the file names */
export const PostsTable: FC<Props> = ({ pageSizes, initialPageSize }) => {
  // Dehydrate data that we fetched on the server in server components higher up the tree
  const queryClient = useQueryClient();
  dehydrate(queryClient);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "title",
        id: "title",
        cell: (info) => info.getValue(),
        header: () => <span>Name</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => format(row.created_at, "MMM d, yyyy, hh:mm a"),
        id: "created_at",
        cell: (info) => info.getValue(),
        header: () => <span>Posted</span>,
        footer: (props) => props.column.id,
      },
    ],
    [],
  );

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const fetchDataOptions = {
    pageIndex,
    pageSize,
  };

  const dataQuery = api.example.getInfinitePosts.useInfiniteQuery(
    { limit: fetchDataOptions.pageSize },
    { getNextPageParam: (lastPage) => lastPage.nextCursor, refetchOnWindowFocus: false },
  );

  const onPaginationChange: OnChangeFn<PaginationState> = (paginationState) => {
    void dataQuery.fetchNextPage().then(() => {
      setPagination(paginationState);
    });
  };

  const defaultData = useMemo(() => [], []);

  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

  const totalCount = (dataQuery.data?.pages[pagination.pageIndex]?.totalCount as number) ?? 0;
  const pageCount = useMemo(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  // Use a dependent query to convert our fetched data into Rows.
  const pageData = dataQuery.data?.pages[pagination.pageIndex]?.items;
  const dataForPageQuery = useQuery(
    ["postsTableDataForPage", pageData],
    () => {
      if (!pageData) return;
      const promises = [];
      for (const item of pageData) {
        promises.push(convertDataToRow(item));
      }
      return Promise.all(promises);
    },
    { enabled: !!pageData },
  );

  const table = useReactTable({
    data: dataForPageQuery.data ?? defaultData,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange: onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    // getPaginationRowModel: getPaginationRowModel(), // If only doing manual pagination, you don't need this
    debugTable: true,
  });

  return (
    <>
      {/* table */}
      <div className="flex w-full max-w-[800px] flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-lg border-b border-gray-200 shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <th
                            scope="col"
                            className="group px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500"
                            key={header.id}
                            colSpan={header.colSpan}
                          >
                            <div className="flex items-center justify-between">
                              {header.isPlaceholder ? null : (
                                <div className="text-sm text-slate-200">
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </div>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {table.getRowModel().rows.map((row) => {
                    return (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => {
                          return (
                            <td className="w-[50%] whitespace-nowrap text-sm text-slate-300" role="cell" key={cell.id}>
                              <Link
                                href={`/post/${row.original.slug}`}
                                className={cn(
                                  "block h-full w-full px-6 py-4",
                                  cell.column.id === "filename" && "hover:underline",
                                )}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </Link>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="h-5" />

        {/* pagination */}
        <div className="flex items-center justify-between">
          {/* simplified mobile version */}
          <div className="flex flex-1 justify-between sm:hidden">
            <div className="flex gap-2">
              <Button variant="subtle" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
            </div>
            <Button variant="subtle" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>

          {/* enhanced desktop version */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div className="flex items-center gap-x-2">
              <span className="text-sm text-gray-500">
                Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                <span className="font-medium">{table.getPageCount()}</span>
              </span>
              <label>
                <span className="sr-only">Items Per Page</span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(val) => {
                    table.setPageSize(Number(val));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizes.map((pgSize) => (
                      <SelectItem key={pgSize} value={`${pgSize}`}>
                        Show {pgSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div className="flex items-center">
              <div>{dataQuery.isFetching ? <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" /> : null}</div>
              <nav className="relative z-0 inline-flex gap-2 -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <div className="flex gap-2">
                  <Button variant="subtle" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    <>
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                    </>
                  </Button>
                </div>
                <Button variant="subtle" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  <>
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  </>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
