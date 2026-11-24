---
id: chuong-18-phan-9
title: 'Chương 18 · Condition variable'
---

Phần này theo mục 18.6, trang 1003–1011. Condition variable trong `<condition_variable>` giúp thread chờ một điều kiện mà không phải liên tục kiểm tra bằng polling. Điều kiện thực tế nằm trong dữ liệu được bảo vệ bởi mutex; notification chỉ báo rằng nên kiểm tra lại dữ liệu đó.

## Chờ predicate

`std::condition_variable::wait` nhận `std::unique_lock<std::mutex>` đang sở hữu mutex. Nó giải phóng mutex và vào trạng thái chờ như một thao tác phối hợp, sau đó lấy lại mutex trước khi trả. Một lần thức dậy có thể là **spurious wakeup**, hoặc thread khác đã thay đổi điều kiện trước khi thread này lấy lại mutex. Vì vậy dùng predicate hoặc vòng lặp:

```cpp
cv.wait(lock, [&] { return ready; });
// Tương đương kiểm tra while (!ready) cv.wait(lock);
```

Đọc và sửa `ready` dưới cùng mutex. Nếu notification xảy ra trước khi thread bắt đầu chờ, predicate vẫn cho thấy trạng thái đã sẵn sàng; condition variable không lưu notification như một hàng đợi sự kiện. Có thể thông báo sau khi mở khóa, miễn lifetime và giao thức dữ liệu được bảo đảm.

Các thread đang chờ cùng một `std::condition_variable` phải sử dụng cùng mutex. Predicate được gọi khi lock đang sở hữu mutex, vì vậy có thể kiểm tra dữ liệu mà mutex đó bảo vệ. Không tự tách thao tác thành “kiểm tra, mở khóa, rồi bắt đầu chờ”: notification có thể đến trong khoảng trống ấy và bị bỏ lỡ.

## Hàng đợi có điểm dừng

Sách minh họa nhiều producer/consumer với queue. Ví dụ sau bổ sung cờ `done` để consumer có thể kết thúc sau khi producer dừng và queue đã được xử lý hết:

```cpp
#include <cassert>
#include <condition_variable>
#include <mutex>
#include <queue>
#include <thread>

int main() {
    std::mutex mutex;
    std::condition_variable cv;
    std::queue<int> queue;
    bool done = false;
    int sum = 0;

    std::thread consumer([&] {
        for (;;) {
            std::unique_lock<std::mutex> lock(mutex);
            cv.wait(lock, [&] { return done || !queue.empty(); });
            if (queue.empty() && done) break;
            int value = queue.front();
            queue.pop();
            lock.unlock();
            sum += value; // chỉ consumer ghi sum; main đọc sau join
        }
    });
    for (int value = 1; value <= 3; ++value) {
        {
            std::lock_guard<std::mutex> lock(mutex);
            queue.push(value);
        }
        cv.notify_one();
    }
    {
        std::lock_guard<std::mutex> lock(mutex);
        done = true;
    }
    cv.notify_all();
    consumer.join();
    assert(sum == 6);
}
```

`notify_one()` đánh thức một thread đang chờ nếu có; `notify_all()` đánh thức tất cả. Thứ tự được chọn không bảo đảm. Khi có nhiều consumer, cờ kết thúc và điều kiện `done || !queue.empty()` giúp tất cả thoát sau khi xử lý dữ liệu còn lại. Ví dụ queue trong sách không có giao thức kết thúc và consumer chạy vô hạn, nên không phù hợp làm chương trình tự kết thúc.

Trong ví dụ của sách, ba producer cùng thêm phần tử và hai consumer cùng lấy phần tử. Việc kiểm tra `empty()`, đọc `front()` và gọi `pop()` phải diễn ra trong cùng vùng được khóa, vì một consumer khác có thể lấy phần tử giữa các thao tác nếu mở khóa quá sớm. Xử lý giá trị sau khi lấy ra có thể thực hiện ngoài vùng khóa để các thread khác không phải chờ lâu. Nếu nhiều thread cùng in, các mảnh đầu ra có thể xen kẽ; cần đồng bộ riêng khi muốn các dòng không bị trộn.

`notify_all()` không tự nhân bản dữ liệu cho mọi consumer: với một queue dùng chung, mỗi phần tử được một consumer lấy ra. Nếu mỗi consumer cần nhận cùng một sự kiện, chương trình phải tự duy trì trạng thái hoặc dữ liệu cho từng consumer.

## Timed wait và biến thể

`wait_for` nhận duration, `wait_until` nhận time point; các overload predicate trả Boolean cho biết predicate thỏa mãn khi kết thúc, còn overload không predicate trả trạng thái timeout hoặc không timeout. Dù có notification, luôn kiểm tra điều kiện. Thời gian thực tế có thể dài hơn thời hạn yêu cầu do scheduling và thời gian lấy lại mutex.

```cpp
#include <chrono>
#include <condition_variable>
#include <mutex>

bool wait_until_ready(std::condition_variable& cv, std::mutex& m,
                      const bool& ready) {
    std::unique_lock<std::mutex> lock(m);
    return cv.wait_for(lock, std::chrono::seconds(1), [&] { return ready; });
}
```

Hàm trả `true` nếu predicate đúng khi kết thúc; mọi truy cập đồng thời tới `ready` phải tuân theo cùng mutex `m`. Với overload không có predicate, `std::cv_status::no_timeout` **không chứng minh điều kiện đã đúng**: chờ có thể kết thúc do spurious wakeup hoặc điều kiện đã thay đổi trước khi lấy lại mutex. Khi cần một giới hạn tổng thời gian qua nhiều lần thức dậy, nên dùng overload có predicate hoặc tính một deadline rồi dùng `wait_until`; lặp lại `wait_for` với cùng duration có thể kéo dài tổng thời gian chờ.

`condition_variable_any` có thể dùng loại lock đáp ứng yêu cầu thay vì chỉ `unique_lock<std::mutex>`. `notify_all_at_thread_exit` trì hoãn mở khóa và thông báo tới khi thread thoát theo hợp đồng của hàm; phải quản lý lifetime của mutex, condition variable và dữ liệu được tham chiếu. Chỉ hủy condition variable sau khi không còn thread cần truy cập nó.

`notify_all_at_thread_exit(cv, std::move(lock))` nhận quyền sở hữu một `unique_lock<std::mutex>` đang khóa. Mutex được giữ đến lúc thread thoát, sau khi các đối tượng thread-local của nó đã được hủy, rồi được mở khóa và các thread chờ được thông báo. Vì mutex vẫn bị giữ trong thời gian đó, tránh làm thêm việc có thể chặn hoặc cần mutex này sau lời gọi. Condition variable không hỗ trợ sao chép; việc tạo có thể thất bại bằng `std::system_error`.
