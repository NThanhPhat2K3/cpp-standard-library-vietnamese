---
id: chuong-06-mau
title: 'Mẫu Chương 6 · Các thành phần STL'
sidebar_label: '06 · Mẫu: Các thành phần STL'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 🧩 Các thành phần của STL

> **Đoạn mẫu:** Phần mở đầu và mục 6.1 của Chương 6.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 165–167.

## Trước hết, STL giúp ta làm gì?

Trái tim của thư viện chuẩn C++ — phần có ảnh hưởng đến kiến trúc tổng thể của nó — là **STL** (*Standard Template Library*). Đây là một thư viện tổng quát cung cấp các giải pháp quản lý tập hợp dữ liệu bằng những thuật toán hiện đại và hiệu quả. Lập trình viên có thể tận dụng các thành tựu về cấu trúc dữ liệu và thuật toán mà không cần tự xây dựng chúng.

Dưới góc nhìn của người lập trình, STL cung cấp nhiều lớp tập hợp đáp ứng các nhu cầu khác nhau, cùng với các thuật toán hoạt động trên chúng. Các thành phần được xây dựng bằng template nên có thể dùng với nhiều kiểu phần tử. STL còn tạo ra một khuôn khổ để bổ sung các lớp tập hợp hoặc thuật toán khác và kết hợp chúng với những thành phần sẵn có.

Nhờ đó, thay vì tự lập trình mảng động, danh sách liên kết, cây nhị phân, bảng băm hay nhiều thuật toán tìm kiếm, ta có thể chọn container thích hợp rồi gọi các hàm thành viên và thuật toán tương ứng. Sự linh hoạt ấy có cái giá: STL không phải lúc nào cũng dễ hiểu ngay. Chương này giới thiệu các khái niệm và kỹ thuật sử dụng; Chương 7–11 đi sâu vào từng thành phần.

## Ba thành phần kết hợp với nhau

STL dựa trên sự phối hợp giữa các thành phần có cấu trúc rõ ràng, trong đó ba thành phần chính là **container**, **iterator** và **algorithm**.

| Thành phần | Vai trò | Ví dụ |
|:---|:---|:---|
| **Container** | Quản lý một tập hợp phần tử. | `std::vector<int>` lưu các số nguyên. |
| **Iterator** | Cho phép duyệt qua các phần tử của một tập hợp. | `begin()` và `end()` xác định phạm vi duyệt. |
| **Algorithm** | Xử lý phần tử: tìm kiếm, sắp xếp, thay đổi… | `std::find` tìm một giá trị trong phạm vi. |

<figure className="book-figure">
  <img src={useBaseUrl('/img/stl-components-figure-6-1.png')} alt="Sơ đồ từ sách: thuật toán tương tác với các container thông qua iterator" />
  <figcaption>Hình 6.1 trong sách gốc: các thành phần STL · trang 166 (trang PDF 195).</figcaption>
</figure>

### 📦 Container — quản lý dữ liệu

Container quản lý tập hợp các đối tượng. Mỗi loại có ưu và nhược điểm riêng, đáp ứng những yêu cầu khác nhau của chương trình. Bên trong, container có thể được triển khai theo dạng mảng, danh sách liên kết hoặc tổ chức các phần tử theo khóa.

### 🔗 Iterator — cầu nối

Iterator dùng để lần lượt đi qua các phần tử của một tập hợp, có thể là toàn bộ container hoặc chỉ một phần. Điểm mạnh của iterator là cung cấp một giao diện nhỏ, tương đối thống nhất cho nhiều loại container, bất kể cấu trúc bên trong là mảng, cây hay bảng băm. Mỗi container cung cấp kiểu iterator phù hợp với cấu trúc của nó.

Giao diện iterator gần giống con trỏ thông thường: dùng `++` để tiến tới phần tử tiếp theo và `*` để truy cập giá trị. Có thể hình dung iterator như một đối tượng hoạt động theo kiểu con trỏ: thao tác “đến phần tử tiếp theo” sẽ được thực hiện phù hợp với cấu trúc của tập hợp.

### ⚙️ Algorithm — xử lý dữ liệu

Algorithm dùng iterator để xử lý các phần tử: tìm kiếm, sắp xếp, thay đổi hoặc sử dụng chúng cho mục đích khác. Nhờ giao diện iterator chung, một thuật toán có thể được viết một lần và dùng với nhiều container tương thích.

Ta cũng có thể cung cấp hàm hỗ trợ để tùy biến thuật toán, chẳng hạn một điều kiện tìm kiếm hoặc phép kết hợp phần tử. Kể từ C++11, lambda giúp diễn đạt những hành vi như vậy thuận tiện hơn.

:::important Ý chính của sơ đồ
Container quản lý **dữ liệu**, algorithm định nghĩa **thao tác**, còn iterator kết nối hai bên. Việc tách chúng ra tạo nên một khuôn khổ linh hoạt mà vẫn gọn.
:::

Ở một góc độ, cách tiếp cận này đi ngược ý tưởng ban đầu của lập trình hướng đối tượng: STL tách dữ liệu khỏi thuật toán thay vì kết hợp chúng. Bù lại, việc kết hợp nhiều loại container và thuật toán tạo ra một khuôn khổ linh hoạt mà vẫn tương đối nhỏ.

STL là một ví dụ của **lập trình tổng quát** (*generic programming*): các thành phần là template và có thể làm việc với nhiều kiểu, miễn là kiểu đó đáp ứng những thao tác cần thiết. Adapter và function object còn cho phép bổ sung, giới hạn hoặc tùy biến thuật toán và giao diện cho các nhu cầu riêng.

:::note Góc nhìn hiện đại
Hình minh họa ý tưởng tổng quát. Trong thực tế, không phải mọi thuật toán đều dùng được với mọi container: iterator và kiểu phần tử phải đáp ứng yêu cầu của thuật toán. Ví dụ, `std::sort` cần random-access iterator nên không dùng trực tiếp với `std::list`; list có hàm thành viên `sort()` riêng.
:::

## 🧪 Một ví dụ ngắn

Ví dụ sau được bổ sung cho bản đọc này, không phải mã trích từ sách:

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers{7, 2, 9, 4};
    auto position = std::find(numbers.begin(), numbers.end(), 9);
    if (position != numbers.end()) {
        std::cout << "Tim thay: " << *position << '\n';
    }
}
```

`numbers` là **container**; `begin()`, `end()` và `position` là các **iterator**; `std::find` là **algorithm**. Nếu không tìm thấy `9`, kết quả là `numbers.end()`, vì vậy cần kiểm tra trước khi dùng `*position`.

**Kết quả:** `Tim thay: 9`

> Đây chỉ là một đoạn mẫu; phần còn lại của Chương 6 chưa được dịch.
