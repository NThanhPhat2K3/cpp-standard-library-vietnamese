---
id: chuong-06-phan-12
title: 'Chương 6 · Thay đổi container và hàm cho thuật toán'
sidebar_label: '06 · Phần 12: Hàm thành viên và transform'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 6.7.2–6.8.1 · Hàm thành viên và hàm cho thuật toán

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 221–226 (PDF trang 250–255). Các hộp ghi chú là phần bổ sung.

## 6.7.2 Thay đổi associative và unordered container

Các thuật toán thay đổi phần tử bằng cách gán hoặc sắp xếp lại, như `std::remove`, không thể tùy ý thay khóa của associative và unordered container. Làm như vậy sẽ phá bất biến thứ tự hoặc băm. Iterator của set không cho sửa khóa; phần tử map có dạng `pair<const Key, T>`, nên toàn bộ pair cũng không thể được gán như phần tử thông thường.

Để xóa theo khóa, dùng member `erase`:

```cpp
std::set<int> coll{1, 2, 3, 4, 5, 6, 7, 8, 9};
auto count = coll.erase(3); // count == 1
// coll: 1 2 4 5 6 7 8 9
```

Overload `erase(key)` trả số phần tử bị xóa; với container khóa duy nhất, kết quả là 0 hoặc 1. Các overload nhận iterator hoặc phạm vi có hợp đồng trả về khác. Multi-container có thể xóa nhiều phần tử tương đương với cùng khóa.

:::note Phân biệt key và mapped value
Không phải mọi thay đổi trong map đều bị cấm: `it->second` là mapped value và có thể sửa khi iterator cho phép. Chính khóa `it->first` là const. Ngoài ra, insert iterator có thể chèn vào associative container thông qua member `insert`; điều không hợp lệ là ghi đè khóa qua iterator thông thường.
:::

## 6.7.3 Thuật toán hay hàm thành viên?

Thuật toán tổng quát chỉ thấy iterator, nên có thể bỏ lỡ thao tác chuyên biệt của container. Ví dụ erase–remove trên list dồn giá trị bằng phép gán rồi xóa phần đuôi; member `list::remove` xóa trực tiếp các node phù hợp:

```cpp
std::list<int> coll{6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6};
coll.erase(std::remove(coll.begin(), coll.end(), 3), coll.end());
coll.remove(4);
```

Cả hai quét danh sách, nhưng hành vi với node, iterator và số phép gán khác nhau. Sách khuyên xét member chuyên biệt khi có lợi thế; đổi lại, mã phụ thuộc loại container hơn. Không nên coi member **luôn** nhanh hơn mọi thuật toán: chọn dựa trên hợp đồng, dữ liệu và phép đo. Chẳng hạn `list::sort()` phù hợp với list vì `std::sort` cần random-access iterator.

## 6.8–6.8.1 Truyền hàm vào thuật toán

Nhiều thuật toán nhận callable để tùy chỉnh thao tác, tiêu chí tìm kiếm hoặc sắp xếp. `for_each` gọi callable với từng phần tử trong phạm vi:

```cpp
void print(int value) { std::cout << value << ' '; }

std::vector<int> coll{1, 2, 3, 4, 5, 6, 7, 8, 9};
std::for_each(coll.cbegin(), coll.cend(), print);
// 1 2 3 4 5 6 7 8 9
```

Ví dụ tiếp theo trong sách dùng `transform` để bình phương từng phần tử từ set sang vector:

```cpp
int square(int value) { return value * value; }

std::set<int> source{1, 2, 3, 4, 5, 6, 7, 8, 9};
std::vector<int> destination;
std::transform(source.cbegin(), source.cend(),
               std::back_inserter(destination), square);
// destination: 1 4 9 16 25 36 49 64 81
```

<figure className="book-figure">
  <img src={useBaseUrl('/img/transform-figure-6-11.png')} alt="transform đọc từ container nguồn, áp dụng square và ghi vào container đích" />
  <figcaption>Hình 6.11 trong sách: cách transform hoạt động · trang 226 (PDF trang 255).</figcaption>
</figure>

`back_inserter` mở rộng vector đích; `square` là thao tác được áp dụng cho mỗi giá trị. Đối với giá trị lớn, `value * value` có thể tràn `int`, nên ví dụ chỉ an toàn với miền đầu vào phù hợp. Mục tiếp theo bàn về predicate — callable trả giá trị logic để kiểm tra một điều kiện.
