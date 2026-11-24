---
id: chuong-05-phan-3
title: 'Chương 5 · Smart pointer và shared_ptr'
sidebar_label: '05 · Phần 3: shared_ptr'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 5.2–5.2.1 · Smart pointer và `shared_ptr`

> **Phạm vi:** Phần mở đầu mục 5.2 và mục 5.2.1; các mục `weak_ptr`, `unique_ptr` và phần chi tiết sẽ tiếp tục ở những trang sau.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 76–84 (PDF trang 105–113). Ghi chú bổ sung và đính chính được đánh dấu riêng.

## 5.2 Smart pointer

Con trỏ cho phép tham chiếu tới một đối tượng vượt khỏi phạm vi thông thường, nhưng việc bảo đảm thời hạn sống của đối tượng phù hợp với các con trỏ trỏ tới nó có thể khó khăn, đặc biệt khi nhiều nơi cùng sử dụng đối tượng. Nếu cùng một đối tượng được tham chiếu từ nhiều container, ta cần tránh cả con trỏ treo, xóa nhiều lần và rò rỉ tài nguyên khi tham chiếu cuối cùng biến mất.

**Smart pointer** hỗ trợ quản lý các vấn đề đó. Chẳng hạn, một smart pointer có thể tham gia theo dõi các chủ sở hữu và chỉ giải phóng đối tượng khi chủ sở hữu cuối cùng không còn. Tuy vậy, không có một loại smart pointer phù hợp với mọi ưu tiên, và dùng smart pointer vẫn có thể sai.

Từ C++11, sách giới thiệu hai loại chính trong `<memory>`:

- `std::shared_ptr`: quyền sở hữu được chia sẻ; đối tượng được hủy khi chủ sở hữu chung cuối cùng giải phóng nó. `weak_ptr`, `bad_weak_ptr` và `enable_shared_from_this` hỗ trợ các tình huống liên quan.
- `std::unique_ptr`: quyền sở hữu độc quyền; có thể **chuyển** quyền sở hữu, giúp tự động giải phóng tài nguyên khi ra khỏi phạm vi, kể cả khi phát sinh ngoại lệ.

C++98 có `auto_ptr`, nhằm giải quyết một phần bài toán quyền sở hữu độc quyền nhưng có thiết kế dễ gây lỗi do hạn chế ngôn ngữ thời đó. `auto_ptr` bị khuyến cáo không dùng từ C++11 và bị loại khỏi tiêu chuẩn C++17.

:::note Góc nhìn hiện đại
Độc quyền ở `unique_ptr` là độc quyền **sở hữu**, không cấm con trỏ hoặc tham chiếu không sở hữu cùng quan sát đối tượng. Những quan sát đó không tự kéo dài thời hạn sống của nó.
:::

## 5.2.1 `std::shared_ptr`

Nhiều phần trong một chương trình có thể cần cùng một đối tượng. `shared_ptr` biểu diễn **quyền sở hữu chung**: nhiều bản sao có thể cùng sở hữu một đối tượng; khi chủ sở hữu cuối cùng giải phóng quyền sở hữu, đối tượng được hủy và tài nguyên liên quan được thu dọn.

Mặc định, với một đối tượng đơn được cấp phát phù hợp bằng `new`, việc thu dọn dùng `delete`. Có thể cung cấp **deleter** khác cho tài nguyên có cách giải phóng riêng, như mảng hoặc handle. Mục tiêu là giải phóng khi không còn chủ sở hữu, không sớm hơn.

### Sử dụng `shared_ptr`

Có thể sao chép, gán, so sánh `shared_ptr` và truy cập đối tượng qua `*` hoặc `->`:

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <vector>

int main() {
    std::shared_ptr<std::string> pNico(new std::string("nico"));
    std::shared_ptr<std::string> pJutta(new std::string("jutta"));

    (*pNico)[0] = 'N';
    pJutta->replace(0, 1, "J");

    std::vector<std::shared_ptr<std::string>> whoMadeCoffee;
    whoMadeCoffee.push_back(pJutta);
    whoMadeCoffee.push_back(pJutta);
    whoMadeCoffee.push_back(pNico);
    whoMadeCoffee.push_back(pJutta);
    whoMadeCoffee.push_back(pNico);

    for (auto ptr : whoMadeCoffee) std::cout << *ptr << ' ';
    std::cout << '\n';
    *pNico = "Nicolai";
    for (auto ptr : whoMadeCoffee) std::cout << *ptr << ' ';
    std::cout << '\n';
    std::cout << "use_count: " << whoMadeCoffee[0].use_count() << '\n';
}
```

<figure className="book-figure">
  <img src={useBaseUrl('/img/shared-ptr-figure-5-1.png')} alt="Các shared_ptr trong vector cùng trỏ đến hai chuỗi; thay đổi Nico thành Nicolai được thấy qua mọi con trỏ tới chuỗi đó" />
  <figcaption>Hình 5.1 trong sách: nhiều shared_ptr chia sẻ đối tượng · trang 79 (PDF trang 108).</figcaption>
</figure>

Các phần tử vector là **bản sao của smart pointer**, không phải bản sao của chuỗi. Vì thế thay đổi chuỗi qua `pNico` cũng hiện ra qua hai phần tử vector cùng trỏ tới chuỗi ấy. Kết quả:

```text
Jutta Jutta Nico Jutta Nico
Jutta Jutta Nicolai Jutta Nicolai
use_count: 4
```

Số `4` là `pJutta` cộng với ba bản sao trong vector; các biến `ptr` tạm của vòng lặp đã hết phạm vi khi in số đếm. `use_count()` cho biết số chủ sở hữu chung tại thời điểm quan sát.

Constructor nhận raw pointer là `explicit`:

```cpp
std::shared_ptr<std::string> a = new std::string("nico"); // LỖI
std::shared_ptr<std::string> b{new std::string("nico")};  // hợp lệ
```

Có thể dùng `make_shared` để tạo đối tượng và smart pointer:

```cpp
auto pNico = std::make_shared<std::string>("nico");
auto pJutta = std::make_shared<std::string>("jutta");
```

Cách này thường cho phép kết hợp cấp phát đối tượng và dữ liệu quản lý, đồng thời đơn giản hóa quản lý ngoại lệ; không nên xem số lần cấp phát cụ thể là bảo đảm tuyệt đối cho mọi implementation. Một smart pointer rỗng có thể nhận quyền sở hữu mới qua `reset()`:

```cpp
std::shared_ptr<std::string> p;
// p = new std::string("nico"); // LỖI
p.reset(new std::string("nico"));
```

Không nhất thiết phải đợi kết thúc phạm vi để giải phóng: gán `nullptr`, `reset`, hoặc hủy các bản sao trong vector làm giảm số chủ sở hữu; khi **tất cả** chủ sở hữu của đối tượng đã từ bỏ quyền sở hữu, deleter được gọi. Trong ví dụ, cần cả việc bỏ `pNico` lẫn bỏ hai bản sao của nó khỏi vector trước khi chuỗi tương ứng được hủy.

### Định nghĩa deleter

Có thể cung cấp lambda làm deleter:

```cpp
std::shared_ptr<std::string> pNico(
    new std::string("nico"),
    [](std::string* p) {
        std::cout << "delete " << *p << '\n';
        delete p;
    });
```

Trong ví dụ vector, sau khi đổi tên, `pNico = nullptr;` rồi `whoMadeCoffee.resize(2);` bỏ các chủ sở hữu của chuỗi Nico; deleter in `delete Nicolai`. Thứ tự hai thao tác có thể đảo lại; deleter vẫn chạy khi chủ sở hữu cuối cùng biến mất. Sách có thêm ví dụ chia sẻ phần tử giữa hai container ở mục 7.11.

:::warning Đảm bảo deleter hoàn tất
Deleter không được để ngoại lệ thoát ra khi `shared_ptr` hủy đối tượng. Các tài nguyên do deleter quản lý phải được giải phóng đầy đủ và đúng loại; bản thân shared ownership không tự làm điều đó.
:::

### Quản lý mảng

Trong bối cảnh C++11 của sách, `shared_ptr<int>` với deleter mặc định dùng cho đối tượng đơn, không dùng `delete[]`. Vì vậy dòng sau biên dịch được nhưng giải phóng sai:

```cpp
std::shared_ptr<int> p(new int[10]); // SAI: delete không khớp new[]
```

Cách C++11 được sách nêu là cung cấp deleter mảng:

```cpp
std::shared_ptr<int> a(new int[10], [](int* p) { delete[] p; });
std::shared_ptr<int> b(new int[10], std::default_delete<int[]>());
```

Sách so sánh với `std::unique_ptr<int[]>`, vốn có specialization cho mảng và `operator[]`; deleter tùy chỉnh của `unique_ptr` là một phần của kiểu template, còn deleter của `shared_ptr` được lưu trong cơ chế quản lý chung.

:::note Góc nhìn hiện đại
Khẳng định của sách rằng `shared_ptr<int[]>` không được hỗ trợ và `shared_ptr` không có `operator[]` chỉ phản ánh bối cảnh C++11. Từ C++17, `std::shared_ptr<T[]>` hỗ trợ mảng và truy cập bằng `[]`. Từ C++20 có thêm các overload `make_shared` cho mảng. Với tập hợp phần tử thông thường, `std::vector` thường là lựa chọn dễ dùng.
:::

### Chính sách hủy khác: tệp và shared memory

Sách minh họa một deleter giữ tên tệp, đóng `std::ofstream` rồi gọi `std::remove()` khi chủ sở hữu cuối cùng biến mất. Điểm chính là deleter có thể giữ thêm trạng thái cần để giải phóng tài nguyên. Bản dịch sau sửa một lỗi của ví dụ gốc: sau khi đóng stream và xóa tệp, phải **xóa cả đối tượng `ofstream` được cấp phát bằng `new`**.

```cpp
#include <cstdio>
#include <fstream>
#include <memory>
#include <string>

struct FileDeleter {
    std::string filename;
    void operator()(std::ofstream* fp) const noexcept {
        fp->close();
        delete fp;
        std::remove(filename.c_str());
    }
};

std::shared_ptr<std::ofstream> fp(
    new std::ofstream("tmpfile.txt"), FileDeleter{"tmpfile.txt"});
```

Ví dụ này giả sử thao tác đóng không để ngoại lệ thoát ra; mã sản xuất cần thiết kế cách báo lỗi dọn dẹp phù hợp. Việc xóa tệp là một chính sách riêng của ứng dụng, không phải hành vi mặc định của `shared_ptr`.

Sách còn minh họa shared memory POSIX bằng `shm_open`, `ftruncate`, `mmap` và một deleter gọi `shm_unlink`; con trỏ được truy cập bằng `smp.get()[i]` vì `shared_ptr<int>` C++11 không cung cấp phép toán chỉ số. Ý tưởng là gắn chính sách dọn dẹp vào chủ sở hữu chung, hoặc đóng gói tài nguyên vào một lớp RAII có constructor, destructor và giao diện phù hợp. Với lớp RAII, cần cân nhắc hoặc vô hiệu hóa copy/assignment để tránh nhân đôi quyền sở hữu sai.

:::warning Đính chính ví dụ POSIX trong sách
`shm_unlink` chỉ xóa tên đối tượng shared memory; nó không thay thế `munmap` cho mapping, cũng không đóng file descriptor. Ví dụ in trong sách còn đề xuất truyền `shm_unlink` trực tiếp làm deleter cho `int*`, nhưng chữ ký của hàm nhận tên `const char*`, không tương thích với `int*`. Cần quản lý riêng mapping, descriptor và tên, kể cả khi có lỗi; không dùng nguyên ví dụ đó như mã sản xuất.
:::
