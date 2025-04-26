const userModel = require("../user/userModel");
const userQuizAttemptModel = require("../user_quiz_attempt/userQuizAttemptModel");
const quizQuestionModel = require("./quizQuestionModel");

const quizQuestionService = {
  addNew: async (data) => {
    const contacts = await quizQuestionModel.insertMany(data);
    return contacts;
  },
  getAll: async (user, page = 1, limit = 10) => {
    let query = { deleted: false };
    if (user) {
      query.user = user;
    }
    const data = await quizQuestionModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await quizQuestionModel.countDocuments(query);
    return {
      total, // Total records
      totalPages: limit ? Math.ceil(total / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: data,
    };
  },
  getTopics: async (user, page = 1, limit = 10) => {
    let query = { deleted: false };
    console.log("query", query);
    const skip = (page - 1) * limit;
    const data = await quizQuestionModel.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: "$topic", // Grouping by topic
          questions: { $push: "$$ROOT" }, // Collect all the questions in the topic
          count: { $sum: 1 },
        },
      },
      // Sort the topics (optional)
      {
        $sort: { _id: 1 }, // Sorting by topic name alphabetically
      },
      // Paginate: skip and limit
      // {
      //   $skip: skip,
      // },
      // {
      //   $limit: limit,
      // },
      {
        $project: {
          topic: "$_id",
          quesitons: "$count",
          _id: 0,
        },
      },
    ]);
    // .sort({ createdAt: -1 })
    // .skip((page - 1) * limit)
    // .limit(limit);
    const total = await quizQuestionModel.aggregate([
      {
        $group: {
          _id: "$topic", // Grouping by topic
        },
      },
    ]);
    return {
      total: total.length, // Total records
      totalPages: limit ? Math.ceil(total.length / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: data,
    };
  },
  // getQuiz: async (user, topic) => {
  //   let userDetails = await userModel.findOne({ _id: user });
  //   const lastTwoAttempts = await userQuizAttemptModel
  //     .find({ user })
  //     .sort({ createdAt: -1 }) // Sort by most recent
  //     .limit(2);
  //   // Extract question IDs from the last two attempts
  //   const excludedQuestionIds = lastTwoAttempts?.flatMap((attempt) =>
  //     attempt.attempts.map((q) => q.question)
  //   );
  //   console.log("topic", topic);
  //   // Fetch 20 random quiz questions, excluding last two attempts' questions
  //   const quizQuestions = await quizQuestionModel.aggregate([
  //     {
  //       $match: {
  //         _id: { $nin: excludedQuestionIds },
  //         //country: userDetails?.country,
  //       },
  //     }, // Exclude previous questions
  //     { $sample: { size: 20 } }, // Pick 20 random questions
  //   ]);

  //   return quizQuestions;
  // },
  getQuiz: async (user, topic) => {
    const userDetails = await userModel.findOne({ _id: user });

    // Normalization function for any country
    const normalizeCountry = (country) => {
      if (!country) return "";
      country = country.toLowerCase().replace(/[^a-z]/g, ""); // remove non-letters

      const countryMap = {
        usa: "unitedstates",
        us: "unitedstates",
        usa: "unitedstates",
        us: "unitedstates",
        america: "unitedstates",
        unitedstatesofamerica: "unitedstates",

        uk: "unitedkingdom",
        gb: "unitedkingdom",
        greatbritain: "unitedkingdom",
        britain: "unitedkingdom",

        uae: "unitedarabemirates",
        emirat: "unitedarabemirates",

        saudi: "saudiarabia",
        saudiarab: "saudiarabia",
        ksa: "saudiarabia",

        pak: "pakistan",
        pk: "pakistan",

        ind: "india",
        in: "india",

        aus: "australia",
        au: "australia",

        can: "canada",
        ca: "canada",

        ger: "germany",
        deutschland: "germany",
        de: "germany",

        fr: "france",

        es: "spain",
        esp: "spain",

        it: "italy",

        ru: "russia",
        russianfederation: "russia",

        chn: "china",
        prc: "china",

        jpn: "japan",
        nippon: "japan",

        kr: "southkorea",
        rok: "southkorea",

        northkorea: "northkorea",
        dprk: "northkorea",

        br: "brazil",
        bra: "brazil",

        mx: "mexico",

        za: "southafrica",
        rsa: "southafrica",

        eg: "egypt",
        egy: "egypt",

        ng: "nigeria",

        bd: "bangladesh",

        af: "afghanistan",

        ir: "iran",
        irn: "iran",

        iq: "iraq",

        tr: "turkey",
        turkiye: "turkey",

        qa: "qatar",

        kw: "kuwait",

        om: "oman",

        jo: "jordan",

        sy: "syria",

        lb: "lebanon",

        ye: "yemen",

        my: "malaysia",
        msia: "malaysia",

        id: "indonesia",

        th: "thailand",

        vn: "vietnam",

        ph: "philippines",
        phl: "philippines",

        sg: "singapore",

        nz: "newzealand",

        ch: "switzerland",

        at: "austria",

        se: "sweden",

        no: "norway",

        dk: "denmark",

        fi: "finland",

        be: "belgium",

        nl: "netherlands",
        holland: "netherlands",

        pl: "poland",

        cz: "czechrepublic",

        gr: "greece",

        il: "israel",

        pt: "portugal",

        ar: "argentina",

        cl: "chile",

        co: "colombia",

        pe: "peru",

        ve: "venezuela",

        ke: "kenya",

        ug: "uganda",

        sd: "sudan",

        et: "ethiopia",

        zw: "zimbabwe",

        zm: "zambia",

        // ...add more small ones if necessary
      };

      return countryMap[country] || country;
    };

    console.log("userDetails.country", userDetails.country);
    const normalizedUserCountry = normalizeCountry(userDetails?.country);
    console.log("normalizedUserCountry", normalizedUserCountry);

    const lastTwoAttempts = await userQuizAttemptModel
      .find({ user })
      .sort({ createdAt: -1 })
      .limit(2);
    const excludedQuestionIds =
      lastTwoAttempts?.flatMap((attempt) =>
        attempt.attempts.map((q) => q.question)
      ) || [];

    // Fetch all questions first (we'll filter manually)
    let allQuestions = await quizQuestionModel.find({
      _id: { $nin: excludedQuestionIds },
    });

    // Normalize each question's country and filter
    const filteredQuestions = allQuestions.filter((q) => {
      const questionCountry = normalizeCountry(q.country);
      return questionCountry === normalizedUserCountry;
    });

    // Shuffle questions randomly
    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);
    let quizQuestions = shuffleArray(filteredQuestions).slice(0, 20);

    // If less than 20, fetch from previously excluded
    if (quizQuestions.length < 20) {
      const needed = 20 - quizQuestions.length;

      const previousQuestions = await quizQuestionModel.find({
        _id: { $in: excludedQuestionIds },
      });

      const filteredPreviousQuestions = previousQuestions.filter((q) => {
        const questionCountry = normalizeCountry(q.country);
        return questionCountry === normalizedUserCountry;
      });

      const extraQuestions = shuffleArray(filteredPreviousQuestions).slice(
        0,
        needed
      );

      quizQuestions = quizQuestions.concat(extraQuestions);
    }

    return quizQuestions;
  },

  getOne: async (id) => {
    return await quizQuestionModel.findById(id);
  },
  update: async (id, data) => {
    return await quizQuestionModel.findByIdAndUpdate(id, data, { new: true });
  },
  delete: async (id) => {
    return await quizQuestionModel.findOneAndUpdate(
      { _id: id },
      { deleted: true }
    );
  },
};

module.exports = quizQuestionService;
