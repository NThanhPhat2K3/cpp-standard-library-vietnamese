---
id: chuong-18-phan-11
title: 'Chương 18 · Thứ tự bộ nhớ của atomic'
---

Phần này theo mục 18.7.4, trang 1019–1022. Các thao tác atomic nhận tham số `std::memory_order`; mặc định là `memory_order_seq_cst`. Lựa chọn yếu hơn vẫn giữ tính nguyên tử của thao tác, nhưng giảm các bảo đảm về thứ tự và đồng bộ giữa thread.

## Release và acquire

Một store `memory_order_release` có thể đồng bộ với load `memory_order_acquire` đọc giá trị do store đó công bố. Khi đó các thao tác được thực hiện trước store có quan hệ happens-before với những thao tác sau load tương ứng. Ví dụ dưới công bố dữ liệu một lần:

```cpp
#include <atomic>
#include <cassert>
#include <thread>

int main() {
    int data = 0;
    std::atomic<bool> ready(false);
    std::thread producer([&] {
        data = 42;
        ready.store(true, std::memory_order_release);
    });
    while (!ready.load(std::memory_order_acquire))
        std::this_thread::yield();
    assert(data == 42);
    producer.join();
}
```

Trong ví dụ, load trả `true` đọc giá trị do producer ghi; do đó đọc `data` sau load là an toàn. Không thể suy ra quan hệ này chỉ vì hai thao tác bất kỳ đều dùng release/acquire: load phải quan sát store hoặc release sequence thích hợp. Nếu producer tiếp tục sửa `data` sau khi báo ready, cần một giao thức khác để tránh truy cập xung đột.

## Relaxed và sequential consistency

`memory_order_relaxed` bảo đảm thao tác trên chính atomic là nguyên tử, nhưng tự nó không công bố các biến thông thường khác. Nếu thay cặp release/acquire trong ví dụ bằng relaxed, việc đọc/ghi `data` không có quan hệ happens-before và tạo data race. Nếu cả `data` lẫn `ready` đều atomic relaxed thì không có data race trên hai atomic đó, nhưng đọc `ready == true` không bảo đảm đọc được `data == 42`.

Relaxed có thể phù hợp cho bộ đếm độc lập, khi kết quả chỉ được đọc sau khi các worker đã join:

```cpp
#include <atomic>
#include <cassert>
#include <thread>

int main() {
    std::atomic<int> count(0);
    std::thread worker([&] {
        for (int i = 0; i < 1000; ++i)
            count.fetch_add(1, std::memory_order_relaxed);
    });
    worker.join();
    assert(count.load(std::memory_order_relaxed) == 1000);
}
```

`memory_order_seq_cst` cung cấp các bảo đảm mạnh hơn, bao gồm thứ tự tổng thể cho các thao tác sequentially consistent theo quy tắc chuẩn. Nó không tự tạo một giao dịch cho nhiều thao tác, và không thay thế việc chứng minh lifetime hoặc đồng bộ các truy cập thông thường.

## API cấp thấp

`load`, `store`, `exchange`, `compare_exchange_*` và `fetch_*` có overload nhận memory order. Mỗi loại thao tác chỉ chấp nhận những order phù hợp; overload compare-exchange có thể nhận order riêng cho thành công và thất bại, với các ràng buộc theo phiên bản chuẩn. `<atomic>` còn cung cấp `atomic_thread_fence` và `atomic_signal_fence`; fence chỉ có tác dụng đồng bộ khi được dùng trong một giao thức thỏa các điều kiện tương ứng, không phải rào chắn phổ quát cho dữ liệu tùy ý.

Sách chủ ý không đi sâu toàn bộ memory model và khuyên tham khảo tài liệu chuyên về concurrency. Với thuật toán không tầm thường, cần lập luận happens-before cho mọi truy cập dùng chung và kiểm thử; việc chương trình chạy đúng một số lần không chứng minh không có data race.
