---
id: chuong-06-phan-1
title: 'Chương 6 · Các nhóm container, vector, deque và array'
sidebar_label: '06 · Phần 1: Các nhóm container'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 6.2 · Container: vector, deque và array

> **Phạm vi:** Mục 6.2 và phần đầu mục 6.2.1 đến hết `array`. Các sequence container còn lại sẽ tiếp tục ở trang sau.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 167–172 (PDF trang 196–201). Các hộp ghi chú là phần bổ sung.

## Ba nhóm container

Container quản lý một tập hợp phần tử. STL cung cấp nhiều loại để đáp ứng những yêu cầu khác nhau:

<figure className="book-figure">
  <img src={useBaseUrl('/img/stl-container-types-figure-6-2.png')} alt="Ba nhóm container STL: sequence, associative và unordered" />
  <figcaption>Hình 6.2 trong sách: các loại container STL · trang 167 (PDF trang 196).</figcaption>
</figure>

1. **Sequence container** là tập hợp có thứ tự vị trí; vị trí thường phụ thuộc vào nơi và thời điểm chèn, không tự sắp theo giá trị. Nếu liên tiếp thêm sáu phần tử vào cuối, chúng xuất hiện theo thứ tự thêm. C++11 có `array`, `vector`, `deque`, `list`, `forward_list`. `array` được bổ sung trong TR1; `forward_list` trong C++11.
2. **Associative container có thứ tự** sắp xếp phần tử theo giá trị hoặc khóa và comparator: `set`, `multiset`, `map`, `multimap`.
3. **Unordered associative container** không duy trì thứ tự sắp xếp theo khóa: `unordered_set`, `unordered_multiset`, `unordered_map`, `unordered_multimap`. Thứ tự duyệt không nên được giả định và có thể thay đổi, chẳng hạn sau rehash.

Unordered container xuất hiện từ TR1. Trong cuốn sách, cụm “associative container” thường chỉ nhóm **có thứ tự**, còn nhóm còn lại được gọi tắt là “unordered container”; thuật ngữ chính thức cho nhóm sau là *unordered associative container*.

Ba nhóm trên là cách phân loại theo quy tắc thứ tự; chúng không phải các lớp dẫn xuất từ nhau. Theo sách, sequence container thường dựa trên mảng hoặc danh sách liên kết, associative container thường dùng cây tìm kiếm cân bằng, và unordered container thường dùng bảng băm. Cấu trúc dữ liệu cụ thể là chi tiết implementation; cần dựa vào hợp đồng và độ phức tạp của chuẩn, không giả định mọi implementation giống hệt nhau.

Thứ tự tự động của associative container không chỉ để in phần tử theo thứ tự: nó còn giúp tìm kiếm khóa với độ phức tạp logarithmic. Sách so sánh trực giác rằng với 1.000 phần tử, tìm kiếm logarithmic có cỡ khoảng 10 bước, còn tìm tuần tự có thể cần trung bình khoảng 500 phép so sánh. Con số thực tế phụ thuộc cấu trúc, dữ liệu và cách đo. Chương 7 trình bày chi tiết từng container; mục 7.12 bàn về cách lựa chọn.

:::note Góc nhìn hiện đại
Trong unordered container, giá trị khóa vẫn ảnh hưởng đến hash và bucket; điều không được bảo đảm là thứ tự duyệt có ý nghĩa sắp xếp hoặc cố định. Với các khóa tương đương trong multi-container, có những bảo đảm riêng về nhóm phần tử và thao tác; không nên diễn giải “unordered” thành hoàn toàn không có quy tắc.
:::

## 6.2.1 Sequence container

Sách giới thiệu các nhóm mảng, vector, deque và danh sách liên kết. Bắt đầu bằng vector vì `array` được đưa vào sau và có một số đặc điểm khác với container thay đổi kích thước.

### `std::vector`

`vector` quản lý các phần tử như một mảng động, hỗ trợ truy cập ngẫu nhiên theo chỉ số. Thêm hoặc bỏ phần tử ở cuối thường hiệu quả; chèn ở đầu hay giữa cần dịch các phần tử phía sau để giữ thứ tự. Thêm vào cuối có độ phức tạp **amortized constant**: một lần riêng lẻ có thể phải cấp phát lại và chuyển hoặc sao chép nhiều phần tử.

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> coll;
    for (int i = 1; i <= 6; ++i) {
        coll.push_back(i);
    }
    for (std::vector<int>::size_type i = 0; i < coll.size(); ++i) {
        std::cout << coll[i] << ' ';
    }
    std::cout << '\n';
}
```

Kết quả: `1 2 3 4 5 6`. Constructor mặc định tạo vector rỗng; `push_back()` thêm vào cuối; `size()` cho số phần tử và `operator[]` truy cập phần tử theo chỉ số. Bản sách dùng `int` làm chỉ số; ví dụ trên dùng `size_type` để phù hợp kiểu của `size()`. `std::forward_list` là ngoại lệ đáng chú ý trong C++11: nó không cung cấp `size()`.

### `std::deque`

`deque` là viết tắt của *double-ended queue*. Nó hỗ trợ truy cập ngẫu nhiên và thêm/bỏ hiệu quả ở cả hai đầu; chèn giữa thường cần di chuyển phần tử. Không nên suy ra các phần tử deque luôn nằm trong một vùng nhớ liên tục như vector.

```cpp
#include <deque>
#include <iostream>

int main() {
    std::deque<float> coll;
    for (int i = 1; i <= 6; ++i) {
        coll.push_front(i * 1.1f);
    }
    for (std::deque<float>::size_type i = 0; i < coll.size(); ++i) {
        std::cout << coll[i] << ' ';
    }
    std::cout << '\n';
}
```

Mỗi giá trị được chèn vào đầu, nên thứ tự in là `6.6 5.5 4.4 3.3 2.2 1.1`. `deque` cũng hỗ trợ `push_back`. `vector` không cung cấp `push_front` vì chèn đầu phải dịch phần tử; tuy nhiên có thể chèn vào đầu hoặc giữa bằng `insert` với chi phí tương ứng. Sách nhận xét rằng các thao tác chuyên biệt thường được cung cấp khi chúng có hiệu năng phù hợp với cấu trúc container.

### `std::array`

`std::array<T, N>` quản lý một mảng có số phần tử cố định `N`, hỗ trợ truy cập ngẫu nhiên. Kích thước là một phần của kiểu: `array<int,5>` và `array<int,10>` là hai kiểu khác nhau.

```cpp
#include <array>
#include <iostream>
#include <string>

int main() {
    std::array<std::string, 5> coll = {"hello", "world"};
    for (std::array<std::string, 5>::size_type i = 0; i < coll.size(); ++i) {
        std::cout << i << ": " << coll[i] << '\n';
    }
}
```

Có năm dòng: hai phần tử đầu là `hello`, `world`, ba phần tử còn lại là chuỗi rỗng. Khi dùng aggregate initialization như trên, các phần tử không được cung cấp sẽ được khởi tạo theo quy tắc tương ứng; với số nguyên, `std::array<int, 5> a{};` cho các phần tử zero. Ngược lại, một biến cục bộ `std::array<int, 5> a;` không khởi tạo giá trị số của từng phần tử.

:::warning Truy cập chỉ số
`operator[]` không kiểm tra giới hạn theo hợp đồng thông thường. Cần bảo đảm chỉ số nhỏ hơn `size()`; nếu muốn kiểm tra và nhận ngoại lệ khi ngoài khoảng, xét dùng `at()`.
:::
