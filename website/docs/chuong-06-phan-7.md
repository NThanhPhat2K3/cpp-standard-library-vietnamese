---
id: chuong-06-phan-7
title: 'Chương 6 · Iterator với set và các nhóm iterator'
sidebar_label: '06 · Phần 7: Ví dụ và nhóm iterator'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 6.3.1–6.3.2 · Ví dụ và nhóm iterator

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 193–199 (PDF trang 222–228). Ghi chú bổ sung được đánh dấu riêng.

## 6.3.1 Iterator với associative container

Các ví dụ dưới đây cho thấy cách dùng iterator tường minh; kỹ thuật này vẫn hữu ích khi cần lưu vị trí hoặc thao tác với một phần phạm vi.

### Duyệt `set`

```cpp
#include <iostream>
#include <set>

int main() {
    typedef std::set<int> IntSet;
    IntSet coll;
    coll.insert(3);
    coll.insert(1);
    coll.insert(5);
    coll.insert(4);
    coll.insert(1);
    coll.insert(6);
    coll.insert(2);

    for (IntSet::const_iterator pos = coll.begin(); pos != coll.end(); ++pos) {
        std::cout << *pos << ' ';
    }
    std::cout << '\n';
}
```

Kết quả là `1 2 3 4 5 6`: `set` sắp theo comparator mặc định và không giữ hai khóa tương đương `1`. Có thể dùng `coll.insert({3, 1, 5, 4, 1, 6, 2});` từ C++11. Các hàm `push_front`/`push_back` không phù hợp vì vị trí được quyết định bởi comparator.

<figure className="book-figure">
  <img src={useBaseUrl('/img/set-tree-figure-6-6.png')} alt="Một cấu trúc cây minh họa set gồm các giá trị từ 1 đến 6" />
  <figcaption>Hình 6.6 trong sách: một set có sáu phần tử · trang 195 (PDF trang 224).</figcaption>
</figure>

Hình mô tả một cây có thể dùng để triển khai; hình dạng cây cụ thể không được chuẩn quy định. Iterator cung cấp thứ tự duyệt theo comparator mà mã gọi không cần biết đường đi nội bộ:

<figure className="book-figure">
  <img src={useBaseUrl('/img/set-iterator-figure-6-7.png')} alt="Iterator duyệt set theo thứ tự khóa dù các node ở các vị trí khác nhau trong cây" />
  <figcaption>Hình 6.7 trong sách: iterator duyệt các phần tử của set · trang 195 (PDF trang 224).</figcaption>
</figure>

Đổi sang `std::multiset<int>` cho phép hai phần tử `1`, nên kết quả là `1 1 2 3 4 5 6`. Để sắp giảm dần có thể dùng `std::set<int, std::greater<int>>` với `<functional>`; comparator là một phần của kiểu container.

### Duyệt `unordered_multiset`

```cpp
#include <iostream>
#include <unordered_set>

int main() {
    std::unordered_multiset<int> coll;
    coll.insert({1, 3, 5, 7, 11, 13, 17, 19, 23, 27, 1});
    for (auto value : coll) std::cout << value << ' ';
    std::cout << '\n';
    coll.insert(25);
    for (auto value : coll) std::cout << value << ' ';
    std::cout << '\n';
}
```

Thứ tự duyệt phụ thuộc implementation và trạng thái bảng băm; việc thêm phần tử có thể gây rehash và thay đổi thứ tự. Các khóa tương đương trong unordered multi-container được nhóm liền nhau. Sách đưa các thứ tự cụ thể chỉ như ví dụ, không phải đầu ra bắt buộc. Nếu đổi thành `unordered_set`, chỉ một phần tử trong mỗi nhóm tương đương được giữ.

Range-based `for` có thể được hình dung dùng iterator `begin()` đến `end()` để đọc từng giá trị. Iterator biết cách duyệt toàn bộ container dù cách lưu trữ bên trong khác list hoặc set.

<figure className="book-figure">
  <img src={useBaseUrl('/img/unordered-iterator-figure-6-8.png')} alt="Sơ đồ iterator đi qua các bucket và các phần tử của unordered multiset" />
  <figcaption>Hình 6.8 trong sách: iterator duyệt unordered multiset · trang 197 (PDF trang 226).</figcaption>
</figure>

Đường màu đậm minh họa một thứ tự duyệt có thể xảy ra trong cách tổ chức bảng băm của hình; đây không phải thứ tự chuẩn bắt buộc. Hai giá trị `1` tương đương được duyệt liền nhau. Hình minh họa trước khi chèn thêm `25` trong ví dụ.

## 6.3.2 Các nhóm iterator

Một **category** mô tả các thao tác và bảo đảm của iterator, không phải một lớp cơ sở cụ thể. Sách phân biệt:

| Nhóm | Khả năng chính | Ví dụ C++11 trong sách |
|:---|:---|:---|
| Input | Đọc khi tiến về phía trước; có thể chỉ hỗ trợ một lượt. | Input stream iterator. |
| Output | Ghi khi tiến về phía trước; thường chỉ một lượt. | Output stream iterator, insert iterator. |
| Forward | Tiến và hỗ trợ multi-pass theo yêu cầu của nhóm. | `forward_list`; unordered container ít nhất forward. |
| Bidirectional | Khả năng forward cộng với lùi bằng `--`. | `list`, `set`, `multiset`, `map`, `multimap`. |
| Random access | Bidirectional cộng với cộng/trừ offset, hiệu iterator và so sánh thứ tự khi hợp lệ. | `vector`, `deque`, `array`, string. |

Category mạnh hơn không tự làm mọi phép toán hợp lệ trong mọi vị trí: chỉ được trừ, so sánh hoặc di chuyển iterator khi các tiền điều kiện phạm vi và container được đáp ứng. Chương 9 trình bày chi tiết hơn.

Để viết vòng lặp generic cho nhiều container, điều kiện `pos != coll.end()` thường phù hợp hơn `pos < coll.end()`, vì `<` yêu cầu khả năng random access và không áp dụng cho iterator list hay set:

```cpp
for (auto pos = coll.begin(); pos != coll.end(); ++pos) {
    // xử lý *pos
}
```

Điều kiện `!=` không tự bảo vệ khỏi việc tăng iterator sai hoặc dùng iterator đã mất hiệu lực. Hãy bảo đảm phạm vi hợp lệ và tuân theo quy tắc invalidation của container.

:::note Góc nhìn hiện đại
C++20 bổ sung iterator concepts, trong đó có contiguous iterator, và thư viện ranges dùng thêm khái niệm sentinel. Bảng trên phản ánh cách phân nhóm và các container trong ấn bản C++11 của sách; một thuật toán cụ thể có thể yêu cầu nhiều điều kiện hơn tên category.
:::
