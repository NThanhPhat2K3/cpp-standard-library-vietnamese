---
id: chuong-04-phan-1
title: 'Chương 4 · Namespace, header và các lớp ngoại lệ'
sidebar_label: '04 · Phần 1: Namespace, header, ngoại lệ'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Chương 4 · Các khái niệm chung

> **Phạm vi:** Phần mở đầu và các mục 4.1–4.3.1; các mục còn lại của chương chưa nằm trong trang này.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 39–44 (PDF trang 68–73). Các hộp “Góc nhìn hiện đại” và “Đính chính” là phần bổ sung.

Chương này giới thiệu những khái niệm nền tảng cần dùng với toàn bộ hoặc phần lớn thư viện chuẩn C++: namespace `std`, tên và định dạng header, xử lý lỗi và ngoại lệ, callable object, các khái niệm cơ bản về xử lý đồng thời và đa luồng, cùng phần nhập môn ngắn về allocator.

## 4.1 Namespace `std`

Khi dùng nhiều module hoặc thư viện, tên có thể xung đột vì cùng một định danh được dùng cho những mục đích khác nhau. C++ đưa ra **namespace** để giải quyết vấn đề này: namespace tạo một phạm vi cho các định danh. Khác với lớp, namespace có thể được mở rộng từ nhiều nơi trong mã nguồn, do đó các thành phần của nó có thể phân bố ở nhiều module vật lý. Thư viện chuẩn C++ là một ví dụ điển hình.

Các tên của thư viện chuẩn được định nghĩa trong namespace `std`. Từ C++11, điều này cũng áp dụng cho các tên từng thuộc phần mở rộng TR1 trong `std::tr1`. Tên namespace `posix` được dành riêng, dù thư viện chuẩn C++ không sử dụng nó theo cách mô tả trong sách.

Sách liệt kê những namespace lồng trong `std` được dùng bởi thư viện:

| Namespace | Nội dung được sách dẫn tới |
|:---|:---|
| `std::rel_ops` | Các toán tử quan hệ bổ sung, mục 5.5.3. |
| `std::chrono` | Đồng hồ và thời lượng, mục 5.7.1. |
| `std::placeholders` | Placeholder dùng với binder, mục 6.10.3. |
| `std::regex_constants` | Hằng số cho biểu thức chính quy, mục 14.6. |
| `std::this_thread` | Thao tác liên quan đến luồng hiện tại, mục 18.3.7. |

Có ba cách dùng một tên trong `std`:

**1. Ghi rõ namespace cho từng tên.**

```cpp
std::cout << std::hex << 3.4 << std::endl;
```

**2. Dùng using-declaration** để đưa từng tên vào phạm vi hiện tại:

```cpp
using std::cout;
using std::endl;
cout << std::hex << 3.4 << endl;
```

**3. Dùng using-directive** để đưa các tên của namespace vào quá trình tra cứu không định danh:

```cpp
using namespace std;
cout << hex << 3.4 << endl;
```

Cách cuối ngắn gọn, nhưng trong mã phức tạp có thể gây xung đột tên hoặc làm chương trình có hành vi khác do quy tắc chọn overload. Không nên dùng using-directive trong bối cảnh không kiểm soát được, đặc biệt trong header. Vì ví dụ trong sách thường nhỏ và hoàn chỉnh, tác giả đôi khi dùng directive này cho tiện.

:::note Góc nhìn hiện đại
Using-directive ảnh hưởng đến **tra cứu tên**; nó không thực sự khai báo mọi thành viên của namespace như các tên mới trong phạm vi hiện tại. Danh sách namespace trong sách phản ánh C++11, không phải danh sách đầy đủ của các chuẩn sau; `std::rel_ops` đã bị khuyến cáo không dùng từ C++20.
:::

## 4.2 Header

Trong quá trình chuẩn hóa, các tên thư viện C++ được đưa vào `std`. Thay đổi đó không tương thích với các header cũ từng đặt tên trong global namespace; một số giao diện lớp cũng thay đổi, dù mục tiêu là giữ tương thích khi có thể. Vì thế chuẩn đưa ra cách đặt tên header mới, cho phép nhà cung cấp vẫn cung cấp header cũ để tương thích ngược.

Trước đó, header có thể dùng các đuôi như `.h`, `.hpp` hay `.hxx`. Tên **standard header** C++ mới không có đuôi:

```cpp
#include <iostream>
#include <string>
```

Các header tương ứng từ thư viện C dùng tiền tố `c` thay cho đuôi `.h`:

```cpp
#include <cstdlib> // tương ứng với <stdlib.h>
#include <cstring> // tương ứng với <string.h>
```

Cách đặt tên giúp phân biệt header của lớp chuỗi C++ với header các hàm chuỗi kiểu C:

```cpp
#include <string>  // std::string và các kiểu chuỗi C++
#include <cstring> // các hàm chuỗi, bộ nhớ từ C
```

Các tên chuẩn tương ứng của header dạng `c...` có trong namespace `std`. Tên standard header không nhất thiết là tên một tệp vật lý không có đuôi: cách xử lý header là chi tiết của implementation; hệ thống có thể dùng tệp khác hoặc khai báo có sẵn. Trong thực tế, nhiều hệ thống dùng đúng tên không đuôi. Với header tự viết, tác giả khuyên dùng đuôi để dễ nhận diện tệp.

Các header C truyền thống như `<stdlib.h>` vẫn được cung cấp để hỗ trợ tương thích với C. Còn các header C++ kiểu cũ như `<iostream.h>` không được tiêu chuẩn C++ quy định; nhà cung cấp có thể cung cấp như phần mở rộng để tương thích với mã cũ. Ngoài namespace còn có các thay đổi giao diện khác, do đó nên dùng hệ header chuẩn hiện đại một cách nhất quán.

:::note Góc nhìn hiện đại
Chi tiết vị trí tên giữa namespace toàn cục và `std` phụ thuộc loại header và quy định của chuẩn: với `<cstdlib>`, hãy dùng tên chuẩn như `std::malloc`; không dựa vào việc cùng tên chắc chắn xuất hiện trong global namespace. Với `<stdlib.h>`, dùng tên toàn cục khi cần giao diện C; đừng dựa vào việc nó chắc chắn cũng khai báo mọi tên trong `std`. Header có thể có macro và những ngoại lệ khác, nên không xem mọi định danh trong header đều là thành viên namespace.
:::

## 4.3 Xử lý lỗi và ngoại lệ

Thư viện chuẩn C++ không đồng nhất: các phần có nguồn gốc, phong cách thiết kế và triển khai khác nhau. Xử lý lỗi là một ví dụ. Các lớp chuỗi cung cấp nhiều cơ chế kiểm tra và báo lỗi; STL và `valarray` thường ưu tiên hiệu năng, ít kiểm tra lỗi logic và có thể chỉ phát sinh ngoại lệ trong các trường hợp lỗi lúc chạy.

:::note Góc nhìn hiện đại
Không phải mọi thao tác trên chuỗi đều kiểm tra mọi lỗi. Ví dụ, cần phân biệt hợp đồng của `at()` và `operator[]`. Với STL, vi phạm tiền điều kiện có thể dẫn đến hành vi không xác định thay vì ngoại lệ.
:::

### 4.3.1 Các lớp ngoại lệ chuẩn

Các lớp ngoại lệ chuẩn được thư viện và ngôn ngữ dùng có gốc chung là `std::exception` trong `<exception>`. Hình 4.1 cho thấy cấu trúc được sách trình bày ở thời điểm C++11:

<figure className="book-figure">
  <img src={useBaseUrl('/img/exception-hierarchy-figure-4-1.png')} alt="Sơ đồ phân cấp các lớp ngoại lệ chuẩn trong C++11 theo Hình 4.1" />
  <figcaption>Hình 4.1 trong sách: phân cấp các lớp ngoại lệ chuẩn · trang 42 (PDF trang 71).</figcaption>
</figure>

Sách chia các ngoại lệ thành ba nhóm: hỗ trợ ngôn ngữ, lỗi logic và lỗi lúc chạy. Lỗi logic về lý thuyết thường có thể tránh bằng chương trình, chẳng hạn kiểm tra tiền điều kiện; lỗi lúc chạy có thể phát sinh từ những yếu tố khó kiểm soát hơn, như tài nguyên không đủ. Đây là cách phân loại để hiểu mục đích, không phải mọi lớp đều trực tiếp kế thừa `logic_error` hoặc `runtime_error`.

:::note Góc nhìn hiện đại
C++ cho phép ném giá trị không kế thừa `std::exception`, kể cả trong mã do ứng dụng cung cấp. Hình cho thấy `std::nested_exception` đứng riêng, không phải lớp dẫn xuất của `std::exception`.
:::

#### Ngoại lệ hỗ trợ ngôn ngữ

- `std::bad_cast`, từ `<typeinfo>`, có thể được ném khi `dynamic_cast` sang kiểu tham chiếu thất bại lúc chạy. Hàm thư viện `use_facet<>` cũng có thể ném nó nếu locale không có facet được yêu cầu.
- `std::bad_typeid`, từ `<typeinfo>`, liên quan đến nhận diện kiểu lúc chạy bằng `typeid`.
- `std::bad_exception`, từ `<exception>`, được dùng trong cơ chế xử lý ngoại lệ bất ngờ liên quan đến `unexpected()` và đặc tả ngoại lệ động cũ; sách lưu ý cơ chế đặc tả đó đã bị khuyến cáo không dùng từ C++11.

:::warning Đính chính về `typeid`
Không phải cứ truyền giá trị `0` hay một con trỏ null cho `typeid` là ném `bad_typeid`. Trường hợp điển hình là toán hạng của `typeid` là phép giải tham chiếu một con trỏ null tới kiểu lớp đa hình, ví dụ `typeid(*p)` khi `p` null. `typeid(p)` chỉ xét kiểu của chính con trỏ.
:::

#### Lỗi logic

Các lớp sau thường dẫn xuất từ `std::logic_error`, biểu thị những điều về lý thuyết chương trình có thể tránh được, chẳng hạn bằng kiểm tra đối số hoặc bảo đảm bất biến lớp:

| Lớp | Mục đích và ví dụ trong sách |
|:---|:---|
| `std::invalid_argument` | Đối số không hợp lệ, ví dụ khởi tạo `bitset` từ ký tự không phải `'0'` hoặc `'1'`. |
| `std::length_error` | Thao tác vượt quá kích thước tối đa cho phép, chẳng hạn nối quá nhiều ký tự vào chuỗi. |
| `std::out_of_range` | Giá trị nằm ngoài khoảng mong đợi, chẳng hạn chỉ số không hợp lệ đối với thao tác có kiểm tra của chuỗi hoặc container. |
| `std::domain_error` | Lỗi miền giá trị. |
| `std::future_error` | Từ C++11, lỗi logic liên quan đến futures và hoạt động bất đồng bộ. |

Các lớp lỗi logic thông thường nằm trong `<stdexcept>`; `future_error` nằm trong `<future>`. Lỗi hệ thống lúc chạy trong cùng lĩnh vực đồng thời có thể được báo bằng `system_error`.

#### Lỗi lúc chạy và các ngoại lệ liên quan

Các lớp dẫn xuất từ `std::runtime_error` báo những tình huống khó tránh hoàn toàn bởi chương trình:

| Lớp | Mục đích và ví dụ trong sách |
|:---|:---|
| `std::range_error` | Lỗi miền giá trị trong tính toán nội bộ; sách nêu chuyển đổi giữa wide string và byte string. |
| `std::overflow_error` | Tràn số học; ví dụ khi chuyển `bitset` sang kiểu số nguyên. |
| `std::underflow_error` | Underflow số học. |
| `std::system_error` | Từ C++11, lỗi hệ thống nền; có thể gặp trong luồng, công cụ kiểm soát data race hoặc `async()`. |

Các ngoại lệ quan trọng khác không nằm dưới `runtime_error` trong sơ đồ:

- `std::bad_alloc`, trong `<new>`, thường được ném khi cấp phát bộ nhớ qua dạng ném ngoại lệ của `new` thất bại. Dạng `nothrow` có hợp đồng báo lỗi khác.
- `std::bad_array_new_length`, dẫn xuất từ `bad_alloc`, báo một số kích thước mảng không hợp lệ, chẳng hạn âm hoặc vượt giới hạn do implementation quy định.
- `std::bad_weak_ptr`, trong `<memory>`, liên quan đến việc tạo shared ownership từ một `weak_ptr` đã hết hiệu lực.
- `std::bad_function_call`, trong `<functional>`, được ném khi gọi một `std::function` không có target.

:::warning Đính chính về `bad_weak_ptr`
Sách mô tả nhầm chiều chuyển đổi: lỗi điển hình là tạo `shared_ptr` bằng constructor nhận một `weak_ptr` đã hết hiệu lực, không phải tạo `weak_ptr` từ `shared_ptr`. `weak_ptr::lock()` báo trường hợp hết hiệu lực bằng `shared_ptr` rỗng thay vì ném ngoại lệ đó.
:::

Ngoài ra, `<ios>` định nghĩa `std::ios_base::failure`. Một stream có thể ném ngoại lệ này khi trạng thái thay đổi do lỗi hoặc hết tệp, tùy exception mask. Từ C++11, nó dẫn xuất từ `system_error`; trước đó dẫn xuất trực tiếp từ `exception`. Xem mục 15.4.4.

Về mặt khái niệm, hết bộ nhớ có thể xem là lỗi hệ thống. Tuy nhiên, vì lý do lịch sử và tầm quan trọng của nó, sách cho biết implementation được khuyến khích dùng `bad_alloc` thay vì `system_error` cho tình huống hết bộ nhớ. Các lớp lỗi lúc chạy thông thường nằm trong `<stdexcept>`, còn `system_error` nằm trong `<system_error>`.

#### Ngoại lệ do thư viện phát sinh và header

Hầu hết các lớp ngoại lệ trên đều có thể xuất hiện từ thư viện; đặc biệt `bad_alloc` có thể xuất hiện khi thư viện cấp phát bộ nhớ. Vì thư viện còn gọi mã do lập trình viên cung cấp, ngoại lệ bất kỳ cũng có thể được phát sinh gián tiếp từ mã đó.

Implementation có thể cung cấp thêm lớp ngoại lệ riêng, cùng cấp hoặc dẫn xuất từ các lớp chuẩn; mã phụ thuộc vào chúng có thể không chuyển được sang implementation khác. Sách khuyên dùng các lớp chuẩn để tăng tính di động.

Các header sách liệt kê để làm việc với nhiều nhóm ngoại lệ:

```cpp
#include <exception>     // exception, bad_exception
#include <stdexcept>     // phần lớn lỗi logic và runtime
#include <system_error>  // lỗi hệ thống
#include <new>           // lỗi cấp phát bộ nhớ
#include <ios>           // ngoại lệ I/O
#include <future>        // lỗi future và xử lý bất đồng bộ
#include <typeinfo>      // bad_cast, bad_typeid
```

Các loại khác được nêu tại nơi sử dụng: `<memory>` cho `bad_weak_ptr` và `<functional>` cho `bad_function_call`.
