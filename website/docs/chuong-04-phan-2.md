---
id: chuong-04-phan-2
title: 'Chương 4 · what(), mã lỗi và điều kiện lỗi'
sidebar_label: '04 · Phần 2: Mã và điều kiện lỗi'
---

# 4.3.2 · Thành viên của các lớp ngoại lệ

> **Phạm vi:** Mục 4.3.2; các mục còn lại của Chương 4 tiếp tục ở phần sau.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 44–52 (PDF trang 73–81). Các hộp “Góc nhìn hiện đại” là phần bổ sung.

Để xử lý ngoại lệ trong một mệnh đề `catch`, có thể dùng giao diện của lớp ngoại lệ. Các lớp ngoại lệ chuẩn cung cấp `what()`; một số lớp còn cung cấp `code()`.

## Thành viên `what()`

Ngoài chính kiểu ngoại lệ, `what()` là giao diện chung để lấy thông tin bổ sung:

```cpp
namespace std {
    class exception {
    public:
        virtual const char* what() const noexcept;
        // ...
    };
}
```

Nó trả về một chuỗi byte kết thúc bằng ký tự null. Nội dung do implementation quy định; chuỗi có thể là một chuỗi đa byte phù hợp để chuyển đổi và hiển thị thành `wstring`. Con trỏ trả về còn hợp lệ cho đến khi đối tượng ngoại lệ bị hủy hoặc được gán giá trị mới.

## Error code và error condition

`system_error` và `future_error` có thêm thông tin chi tiết, nhưng trước tiên cần phân biệt:

- **Error code** là đối tượng gọn chứa giá trị mã lỗi, có thể phụ thuộc implementation; một số mã cũng được chuẩn hóa.
- **Error condition** là đối tượng mô tả một điều kiện lỗi theo cách trừu tượng và có thể chuyển đổi giữa các hệ thống.

Tùy trường hợp, chuẩn quy định mã lỗi hoặc điều kiện lỗi:

- `std::errc` cung cấp các điều kiện lỗi tương ứng những giá trị lỗi hệ thống chuẩn trong `<cerrno>` hoặc `<errno.h>`.
- `std::io_errc` cung cấp mã lỗi cho `std::ios_base::failure` của stream từ C++11.
- `std::future_errc` cung cấp mã lỗi cho `std::future_error` trong thư viện đồng thời.

### Điều kiện lỗi `std::errc`

Các bảng 4.1 và 4.2 dưới đây giữ tên và ánh xạ trong sách. Đây là các scoped enumerator, ví dụ `std::errc::permission_denied`; cột bên phải là hằng `errno` tương ứng, không nhất thiết là giá trị mã lỗi cụ thể do hệ điều hành trả về.

| Điều kiện `std::errc::` | Hằng `errno` tương ứng |
|:---|:---|
| `address_family_not_supported` | `EAFNOSUPPORT` |
| `address_in_use` | `EADDRINUSE` |
| `address_not_available` | `EADDRNOTAVAIL` |
| `already_connected` | `EISCONN` |
| `argument_list_too_long` | `E2BIG` |
| `argument_out_of_domain` | `EDOM` |
| `bad_address` | `EFAULT` |
| `bad_file_descriptor` | `EBADF` |
| `bad_message` | `EBADMSG` |
| `broken_pipe` | `EPIPE` |
| `connection_aborted` | `ECONNABORTED` |
| `connection_already_in_progress` | `EALREADY` |
| `connection_refused` | `ECONNREFUSED` |
| `connection_reset` | `ECONNRESET` |
| `cross_device_link` | `EXDEV` |
| `destination_address_required` | `EDESTADDRREQ` |
| `device_or_resource_busy` | `EBUSY` |
| `directory_not_empty` | `ENOTEMPTY` |
| `executable_format_error` | `ENOEXEC` |
| `file_exists` | `EEXIST` |
| `file_too_large` | `EFBIG` |
| `filename_too_long` | `ENAMETOOLONG` |
| `function_not_supported` | `ENOSYS` |
| `host_unreachable` | `EHOSTUNREACH` |
| `identifier_removed` | `EIDRM` |
| `illegal_byte_sequence` | `EILSEQ` |
| `inappropriate_io_control_operation` | `ENOTTY` |
| `interrupted` | `EINTR` |
| `invalid_argument` | `EINVAL` |
| `invalid_seek` | `ESPIPE` |
| `io_error` | `EIO` |
| `is_a_directory` | `EISDIR` |
| `message_size` | `EMSGSIZE` |
| `network_down` | `ENETDOWN` |
| `network_reset` | `ENETRESET` |
| `network_unreachable` | `ENETUNREACH` |
| `no_buffer_space` | `ENOBUFS` |
| `no_child_process` | `ECHILD` |
| `no_link` | `ENOLINK` |
| `no_lock_available` | `ENOLCK` |
| `no_message_available` | `ENODATA` |
| `no_message` | `ENOMSG` |
| `no_protocol_option` | `ENOPROTOOPT` |
| `no_space_on_device` | `ENOSPC` |
| `no_stream_resources` | `ENOSR` |
| `no_such_device_or_address` | `ENXIO` |
| `no_such_device` | `ENODEV` |
| `no_such_file_or_directory` | `ENOENT` |
| `no_such_process` | `ESRCH` |
| `not_a_directory` | `ENOTDIR` |
| `not_a_socket` | `ENOTSOCK` |
| `not_a_stream` | `ENOSTR` |
| `not_connected` | `ENOTCONN` |
| `not_enough_memory` | `ENOMEM` |
| `not_supported` | `ENOTSUP` |
| `operation_canceled` | `ECANCELED` |
| `operation_in_progress` | `EINPROGRESS` |
| `operation_not_permitted` | `EPERM` |
| `operation_not_supported` | `EOPNOTSUPP` |
| `operation_would_block` | `EWOULDBLOCK` |
| `owner_dead` | `EOWNERDEAD` |
| `permission_denied` | `EACCES` |
| `protocol_error` | `EPROTO` |
| `protocol_not_supported` | `EPROTONOSUPPORT` |
| `read_only_file_system` | `EROFS` |
| `resource_deadlock_would_occur` | `EDEADLK` |
| `resource_unavailable_try_again` | `EAGAIN` |
| `result_out_of_range` | `ERANGE` |
| `state_not_recoverable` | `ENOTRECOVERABLE` |
| `stream_timeout` | `ETIME` |
| `text_file_busy` | `ETXTBSY` |
| `timed_out` | `ETIMEDOUT` |
| `too_many_files_open_in_system` | `ENFILE` |
| `too_many_files_open` | `EMFILE` |
| `too_many_links` | `EMLINK` |
| `too_many_symbolic_link_levels` | `ELOOP` |
| `value_too_large` | `EOVERFLOW` |
| `wrong_protocol_type` | `EPROTOTYPE` |

*Bảng 4.1 và 4.2 của sách, trang 46–47.*

### Mã lỗi `std::future_errc` và `std::io_errc`

| Mã `std::future_errc::` | Ý nghĩa |
|:---|:---|
| `broken_promise` | Shared state bị bỏ dở. |
| `future_already_retrieved` | `get_future()` đã được gọi. |
| `promise_already_satisfied` | Shared state đã có giá trị hoặc ngoại lệ, hoặc thao tác tương ứng đã được thực hiện. |
| `no_state` | Không có shared state. |

*Bảng 4.3 của sách, trang 47.* Mã được sách nêu cho `ios_base::failure` là `std::io_errc::stream`.

Chú thích của tác giả nhắc rằng bản C++11 ban đầu gán `future_errc::broken_promise` giá trị `0`, trong khi `0` thường biểu thị không có lỗi; đây là sai sót thiết kế đã được sửa, các giá trị không nên được giả định bằng một con số cụ thể.

## Làm việc với error code và error condition

Thư viện cung cấp hai kiểu `std::error_code` và `std::error_condition`. Cơ chế so sánh cho phép đối chiếu các đối tượng lỗi với những giá trị enum tương ứng:

```cpp
if (ec == std::errc::invalid_argument) {
    // xử lý điều kiện đối số không hợp lệ
}
if (ec == std::future_errc::no_state) {
    // xử lý mã future không có shared state
}
```

Việc so sánh code với condition dùng quy tắc tương đương của category; hai giá trị số giống nhau không mặc nhiên biểu thị cùng một lỗi.

`std::system_error`, lớp dẫn xuất `std::ios_base::failure` và `std::future_error` cung cấp hàm thành viên không ảo `code()` trả về tham chiếu tới `std::error_code`:

```cpp
// Minh họa giao diện, không phải định nghĩa đầy đủ
const std::error_code& code() const noexcept;
```

`what()` là hàm ảo nhờ lớp cơ sở, dù các khai báo dẫn xuất không nhất thiết viết lại từ khóa `virtual`. Các lớp thực tế được khai báo trong những header khác nhau.

### `std::error_code`

```cpp
const std::error_category& category() const noexcept;
int value() const noexcept;
std::string message() const;
explicit operator bool() const noexcept;
std::error_condition default_error_condition() const noexcept;
```

- `category()` và `value()` cùng nhận diện lỗi: các thư viện khác nhau có thể dùng cùng một số nguyên cho những lỗi khác nhau.
- `message()` trả về thông điệp tương ứng. Nó thường là một phần của `what()` nhưng điều đó không bắt buộc.
- Chuyển đổi tường minh sang `bool` cho biết mã có giá trị khác `0`; thông thường khi bắt một ngoại lệ thì mã sẽ biểu thị có lỗi.
- `default_error_condition()` trả về điều kiện tương ứng. `std::error_condition` cũng cung cấp `category()`, `value()`, `message()` và chuyển đổi tường minh sang `bool`.

### `std::error_category`

`std::error_category` cung cấp `name()`, `message(int)`, `default_error_condition(int)` và phép so sánh category. `name()` cho tên; hai hàm còn lại ánh xạ giá trị nhận vào sang thông điệp hoặc điều kiện mặc định. Các hàm tương ứng của `error_code` dùng category để thực hiện công việc này.

Sách liệt kê bốn category thường gặp:

| Category | Hàm lấy category | Vai trò |
|:---|:---|:---|
| `iostream` | `std::iostream_category()` | Lỗi stream I/O. |
| `generic` | `std::generic_category()` | Điều kiện lỗi tổng quát dựa trên các giá trị POSIX. |
| `system` | `std::system_category()` | Mã lỗi hệ thống cụ thể của implementation. |
| `future` | `std::future_category()` | Lỗi liên quan đến future. |

Các hàm được khai báo lần lượt trong `<ios>`, `<system_error>`, `<system_error>` và `<future>`. Có thể kiểm tra category của một ngoại lệ có `code()`:

```cpp
if (e.code().category() == std::iostream_category()) {
    // xử lý lỗi I/O
}
```

:::note Góc nhìn hiện đại
Category `system` có thể dùng các giá trị lỗi của hệ điều hành và ánh xạ chúng sang generic condition tương ứng; không nên kết luận rằng mọi giá trị của nó đều khác POSIX. Khi kiểm tra loại lỗi di động, ưu tiên so sánh với `std::errc` thay vì chỉ so sánh số nguyên.
:::

## Ví dụ xử lý các loại ngoại lệ

Ví dụ sau giữ cấu trúc trong sách: một hàm template in chi tiết `code()`, còn hàm thứ hai ném lại ngoại lệ hiện hành rồi bắt theo thứ tự từ lớp cụ thể đến lớp cơ sở.

```cpp
#include <exception>
#include <future>
#include <iostream>
#include <new>
#include <system_error>

template <typename T>
void processCodeException(const T& e) {
    auto c = e.code();
    std::cerr << "- category: " << c.category().name() << '\n';
    std::cerr << "- value: " << c.value() << '\n';
    std::cerr << "- msg: " << c.message() << '\n';
    std::cerr << "- def category: "
              << c.default_error_condition().category().name() << '\n';
    std::cerr << "- def value: "
              << c.default_error_condition().value() << '\n';
    std::cerr << "- def msg: "
              << c.default_error_condition().message() << '\n';
}

void processException() {
    try {
        throw; // ném lại ngoại lệ đang được xử lý
    } catch (const std::ios_base::failure& e) {
        std::cerr << "I/O EXCEPTION: " << e.what() << '\n';
        processCodeException(e);
    } catch (const std::system_error& e) {
        std::cerr << "SYSTEM EXCEPTION: " << e.what() << '\n';
        processCodeException(e);
    } catch (const std::future_error& e) {
        std::cerr << "FUTURE EXCEPTION: " << e.what() << '\n';
        processCodeException(e);
    } catch (const std::bad_alloc& e) {
        std::cerr << "BAD ALLOC EXCEPTION: " << e.what() << '\n';
    } catch (const std::exception& e) {
        std::cerr << "EXCEPTION: " << e.what() << '\n';
    } catch (...) {
        std::cerr << "EXCEPTION (unknown)\n";
    }
}
```

Cách gọi:

```cpp
try {
    // ... thao tác có thể ném ngoại lệ
} catch (...) {
    processException();
}
```

`ios_base::failure` phải được bắt trước `system_error` vì nó là lớp dẫn xuất. `throw;` chỉ được dùng khi đang xử lý một ngoại lệ; nếu không có ngoại lệ đang hoạt động, chương trình gọi `std::terminate()`.

## Các thành viên khác

Những thành viên còn lại tạo, sao chép, gán và hủy đối tượng ngoại lệ. Ngoài `what()` và, với một số lớp, `code()`, sách lưu ý rằng các lớp chuẩn không nói chung cung cấp chi tiết về ngữ cảnh hoặc chỉ số sai. Mã di động có thể in thông điệp và xét kiểu ngoại lệ:

```cpp
try {
    // ...
} catch (const std::exception& error) {
    std::cerr << error.what() << std::endl;
    // ... xử lý thêm
}
```

Ví dụ, khi bắt `std::bad_alloc`, chương trình có thể cố gắng giải phóng hoặc tìm thêm bộ nhớ. Không nên phân tích nội dung `what()` như một giao thức ổn định, vì thông điệp phụ thuộc implementation.
